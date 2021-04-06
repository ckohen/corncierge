'use strict';

const { Client, Collection, MessageEmbed, Structures } = require('discord.js');

const EventManager = require('./EventManager');
const CommandManager = require('../discord/commands/CommandManager');
const embeds = require('../discord/embeds');
const events = require('../discord/events');
const interactionHandler = require('../discord/interactionHandler');
const applicationCommands = require('../discord/interactions/applicationCommands');

const { collect, constants, discord: util } = require('../util/UtilManager');

Structures.extend('Message', util.extendMessage);

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
     * The application commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.applicationCommands = new Collection();

    /**
     * The name of a table from the TableManager
     * @typedef {string} TableName
     */

    /**
     * The local cache of database tables, each mapped by guild id
     * @type {Object<TableName, Collection<Snowflake, Object>>}
     */
    this.cache = {};
  }

  /**
   * Initialize the manager.
   * @returns {Promise<string>}
   */
  async init() {
    this.app.log.debug(module, 'Registering events');
    this.attach();
    // Temporary Addition to handle interactions before discord.js does
    this.driver.ws.on('INTERACTION_CREATE', async packet => {
      const result = await interactionHandler(this.driver, packet);

      await this.driver.api.interactions(packet.id, packet.token).callback.post({
        data: result,
      });
    });
    // End addition

    this.app.log.debug(module, 'Registering commands');
    this.commandManager.registerBuiltIn();
    /**
     * The commands for the socket, mapped by input. Only available after DiscordManager#init()
     * @type {Collection<string, BaseCommand>}
     */
    this.commands = this.commandManager.registered;

    this.app.log.debug(module, 'Registering interactions');
    Object.entries(applicationCommands).forEach(([command, handler]) => {
      this.applicationCommands.set(command, handler);
    });

    await this.setCache();

    this.app.log.debug(module, 'Logging in');
    return this.driver.login(this.options.token).catch(err => {
      this.app.log.critical(module, `Login: ${err}`);
    });
  }

  /**
   * Cache all managers and music.
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
          return this.cacheTable(table, this.cache[name], 'guildID');
        }),
      ),
      this.cacheMusic(),
      this.cacheRooms(),
    ]).catch(err => {
      this.app.log.fatal(module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the music data.
   * @returns {Promise<void>}
   * @private
   */
  async cacheMusic() {
    this.app.log.debug(module, 'Caching music');
    const volumes = await this.app.database.tables.volumes.get().catch(err => this.app.log.warn(module, `Error encounted while caching music volumes: ${err}`));
    if (!this.cache.musicData) {
      this.cache.musicData = new Collection();
    }
    this.cache.musicData.clear();
    volumes.forEach(volume => {
      if (this.cache.musicData.get(volume.guildID)) {
        this.cache.musicData.get(volume.guildID).volume = Number(volume.volume);
      } else {
        this.cache.musicData.set(volume.guildID, { queue: [], isPlaying: false, nowPlaying: null, songDispatcher: null, volume: Number(volume.volume) });
      }
    });
  }

  /**
   * Cache room data.
   * @returns {Promise<void>}
   * @private
   */
  async cacheRooms() {
    this.app.log.debug(module, 'Caching rooms');
    const rooms = await this.app.database.tables.rooms.get().catch(err => this.app.log.warn(module, `Error encountered while caching rooms: ${err}`));
    if (!rooms) return;
    if (!this.cache.rooms) {
      this.cache.rooms = new Collection();
    }
    this.cache.rooms.clear();
    let roomGuild, roomID;
    let guild;
    rooms.forEach(room => {
      [roomGuild, roomID] = room.guildRoomID.split('-');
      guild = this.cache.rooms.get(roomGuild);
      if (!guild) {
        this.cache.rooms.set(roomGuild, new Collection());
        guild = this.cache.rooms.get(roomGuild);
      }
      guild.set(roomID, room.data);
    });
  }

  /**
   * Query the database and set a given cache.
   * @param {BaseTable} table the database table to get from
   * @param {Collection} map the map to store data in
   * @param {string} key a key to use for the new map
   * @param {string} [secondaryKey=false] a dashed key to use for the new map
   * @returns {Promise}
   * @private
   */
  cacheTable(table, map, key, secondaryKey = false) {
    return table.get().then(all => {
      map.clear();
      collect(map, all, key, secondaryKey);
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
   * @param {StringResolvable|APIMessage} [content] the content to send
   * @param {MessageOptions|MessageAdditions} [options] The options to provide
   */
  sendMessage(slug, content, options) {
    const channel = this.getChannel(slug);

    if (!channel) {
      this.app.log.warn(module, `No channel set for slug: ${slug}`);
      return;
    }

    channel.send(content, options).catch(err => {
      this.app.log.warn(module, `Send message: ${err}`);
    });
  }

  /**
   * Send a webhook with the given content and embed.
   * @param {string} slug the webhook name in settings to get and send to
   * @param {StringResolvable|APIMessage} [content] the content to send
   * @param {MessageOptions|MessageAdditions} [options] The options to provide
   */
  sendWebhook(slug, content, options) {
    this.getWebhook(slug).then(webhook => {
      if (!webhook) {
        this.app.log.warn(module, `No webhook set for slug: ${slug}`);
        return;
      }

      webhook.send(content, options).catch(err => {
        this.app.log.warn(module, `Send webhook: ${err}`);
      });
    });
  }
}

module.exports = DiscordManager;