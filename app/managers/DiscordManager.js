'use strict';

const { Client, Collection, MessageEmbed } = require('discord.js');

const EventManager = require('./EventManager');
const CommandManager = require('../discord/commands/CommandManager');
const embeds = require('../discord/embeds');
const events = require('../discord/events');
const InteractionManager = require('../discord/interactions/InteractionManager');

const { collect, constants } = require('../util/UtilManager');

/**
 * Discord manager for the application.
 * @extends {EventManager}
 */
class DiscordManager extends EventManager {
  constructor(app) {
    super(app, new Client(app.options.discord.clientOptions), app.options.discord, events);

    /**
     * The Discord.js API / Websocket Client.
     * @type {discord.js.Client}
     * @name DiscordManager#driver
     */

    /**
     * The Discord rich embeds.
     * @type {Object}
     */
    this.embeds = embeds;

    /**
     * The message transformers.
     * @type {Object}
     */
    this.messages = constants.discordMessages;

    /**
     * The command manager that registers all commands
     * @type {CommandManager}
     */
    this.commandManager = new CommandManager(this);

    /**
     * The interaction manager that registers all interactions
     * @type {InteractionManager}
     */
    this.interactionManager = new InteractionManager(this);

    /**
     * The name of a table from the TableManager
     * @typedef {string} TableName
     */

    /**
     * The local cache of database tables, each mapped by guild id
     * @type {Object<TableName, Collection<Snowflake, Object>>}
     */
    this.cache = {
      buttonRoles: new Collection(),
    };
  }

  /**
   * Initialize the manager.
   * @returns {Promise<string>}
   */
  async init() {
    this.app.log.debug(module, 'Registering events');
    this.attach();

    this.app.log.debug(module, 'Registering commands');
    this.commandManager.registerBuiltIn();
    /**
     * The commands for the socket, mapped by input. Only available after DiscordManager#init()
     * @type {Collection<string, BaseCommand>}
     */
    this.commands = this.commandManager.registered;

    this.app.log.debug(module, 'Registering interactions');
    /**
     * The interactions for the socket, mapped by type and then by name. Only available after DiscordManager#init()
     * @type {Interactions}
     */
    this.interactions = this.interactionManager.registered;

    await this.setCache();

    this.app.log.debug(module, 'Logging in');
    return this.driver.login(this.options.token).catch(err => {
      this.app.log.critical(module, `Login`, err);
    });
  }

  /**
   * Sends global registration data to discord for all application commands that do not have guilds specified
   * OR
   * when guildId is provided, register all global commands (that are not yet registered globally) and commands for the guild specified
   * WARNING: this overwrites all existing global / guild commands, if you do not want this to happen, use `registerCommand`
   * @param {Snowflake} [guildId] the id of the guild whose application command to register
   * @returns {Promise<Collection<Snowflake, ApplicationCommand>>}
   */
  async registerCommands(guildId) {
    let data = [];
    let global;
    if (guildId) {
      const commands = await this.driver.application.commands.fetch();
      global = new Collection();
      for (const command of commands.values()) {
        global.set(command.name, command);
      }
    }
    this.interactions.applicationCommands.forEach(interaction => {
      if (guildId) {
        if (Array.isArray(interaction.guilds) && !interaction.guilds.includes(guildId)) return;
        if (typeof interaction.guilds === 'string' && interaction.guilds !== guildId) return;
        if (global.get(interaction.name)?.equals(interaction.definition)) return;
        data.push(interaction.definition);
        return;
      }
      if (interaction.guilds) return;
      data.push(interaction.definition);
    });
    return this.driver.application.commands.set(data, guildId);
  }

  /**
   * Register an interaction
   * @param {string} name the name of the application command to register
   * @returns {Promise<ApplicationCommand>}
   */
  async registerCommand(name) {
    let promises = [];
    let results;
    const interaction = this.interactions.applicationCommands.get(name);
    if (!interaction) return 'No such interaction';
    if (!interaction.definition) return 'This command has no definition';
    if (Array.isArray(interaction.guilds)) {
      interaction.guilds.forEach(guildId => {
        promises.push(this.driver.application.commands.create(interaction.definition, guildId));
      });
      results = await Promise.all(promises).catch(err => this.app.log.warn(module, `Error encountered while registering commmand`, err));
      return results.map(result => ({ guild: result.guild_id, id: result.id, name: result.name }));
    }
    return this.driver.application.commands
      .create(interaction.definition, interaction.guilds)
      .catch(err => this.app.log.warn(module, `Error encountered while registering commmand`, err));
  }

  /**
   * Cache all managers.
   * @returns {Promise<void>}
   */
  setCache() {
    return Promise.all([
      Promise.all(
        this.app.database.tables.discord.map(table => {
          const name = table.constructor.name.replace(/Table$/, '');
          this.app.log.debug(module, `Caching ${name}`);
          if (!this.cache[name]) {
            this.cache[name] = new Collection();
          }
          return this.cacheTable(table, this.cache[name], 'guildId');
        }),
      ),
      this.cacheRooms(),
    ]).catch(err => {
      this.app.log.fatal(module, `Cache`, err);
    });
  }

  /**
   * Cache room data.
   * @returns {Promise<void>}
   * @private
   */
  async cacheRooms() {
    this.app.log.debug(module, 'Caching rooms');
    const rooms = await this.app.database.tables.rooms.get().catch(err => this.app.log.warn(module, `Error encountered while caching rooms`, err));
    if (!rooms) return;
    if (!this.cache.rooms) {
      this.cache.rooms = new Collection();
    }
    this.cache.rooms.clear();
    let roomGuild, roomId;
    let guild;
    rooms.forEach(room => {
      [roomGuild, roomId] = room.guildRoomId.split('-');
      guild = this.cache.rooms.get(roomGuild);
      if (!guild) {
        this.cache.rooms.set(roomGuild, new Collection());
        guild = this.cache.rooms.get(roomGuild);
      }
      guild.set(roomId, room.data);
    });
  }

  /**
   * Query the database and set a given cache.
   * @param {BaseTable} table the database table to get from
   * @param {Collection} map the map to store data in
   * @param {string} key a key to use for the new map
   * @returns {Promise}
   * @private
   */
  cacheTable(table, map, key) {
    return table.get().then(all => {
      map.clear();
      collect(map, all, key);
    });
  }

  /**
   * Get the channel for the given slug.
   * @param {string} slug the channel name in settings to get
   * @returns {?Channel}
   */
  getChannel(slug) {
    const id = this.app.settings.get(`discord_channel_${slug}`).split(',')[0];
    return this.driver.channels.cache.get(id);
  }

  /**
   * Get the webhook for the given slug.
   * @param {string} slug the webhook name in settings to get
   * @returns {?Promise<Webhook>}
   */
  getWebhook(slug) {
    let uri;
    try {
      uri = this.app.settings.get(`discord_webhook_${slug}`);
      this.driver.fetchWebhook(...uri.split('/'));
    } catch {
      return Promise.resolve(false);
    }
    return this.driver.fetchWebhook(...uri.split('/'));
  }

  /**
   * Get the transformed content for the given slug.
   * @param {string} slug the name of the message to get
   * @param {Array} args arguments to pass to the transformer
   * @returns {?string}
   */
  getContent(slug, args) {
    const transformer = this.messages[slug];

    if (typeof transformer !== 'function') {
      this.app.log.warn(module, `Unknown content: ${transformer}`);
      return null;
    }

    return transformer(...args);
  }

  /**
   * Get the transformed embed for the given slug.
   * @param {string} slug the name of the embed to get
   * @param {Array} args arguments to pass to the constructor
   * @returns {?string}
   */
  getEmbed(slug, args) {
    const transformer = this.embeds[slug];

    if (typeof transformer !== 'function') {
      this.app.log.warn(module, `Unknown embed: ${slug}`);
      return null;
    }

    return transformer(new MessageEmbed(), ...args);
  }

  /**
   * Send a message with the given content and embed.
   * @param {string} slug the channel name in settings to get and send to
   * @param {string|MessagePayload} [content] the content to send
   * @param {MessageOptions} [options] The options to provide
   */
  sendMessage(slug, content, options) {
    const channel = this.getChannel(slug);

    if (!channel) {
      this.app.log.warn(module, `No channel set for slug: ${slug}`);
      return;
    }

    channel.send({ content, ...options }).catch(err => {
      this.app.log.warn(module, `Send message`, err);
    });
  }

  /**
   * Send a webhook with the given content and embed.
   * @param {string} slug the webhook name in settings to get and send to
   * @param {string|MessagePayload} [content] the content to send
   * @param {MessageOptions} [options] The options to provide
   */
  sendWebhook(slug, content, options) {
    this.getWebhook(slug).then(webhook => {
      if (!webhook) {
        this.app.log.warn(module, `No webhook set for slug: ${slug}`);
        return;
      }

      webhook.send({ content, ...options }).catch(err => {
        this.app.log.warn(module, `Send webhook`, err);
      });
    });
  }
}

module.exports = DiscordManager;
