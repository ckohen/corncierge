'use strict';

const { Client, Collection } = require('discord.js');

const Composer = require('./Composer');
const commands = require('./commands');
const embeds = require('./embeds');
const events = require('./events');
const interactionHandler = require('./interactionHandler');
const applicationCommands = require('./interactions/applicationCommands');
const messages = require('./messages');
const Socket = require('../Socket');

const { collect } = require('../util/helpers');

/**
 * Discord manager for the application.
 * @extends {Socket}
 * @private
 */
class DiscordManager extends Socket {
  /**
   * Create a new Discord manager instance.
   * @param {Application} app the application that instantiated this
   */
  constructor(app) {
    super();

    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The Discord rich embeds.
     * @type {Object}
     */
    this.embeds = embeds;

    /**
     * The socket events.
     * @type {Object}
     */
    this.events = events;

    /**
     * The message transformers.
     * @type {Object}
     */
    this.messages = messages;

    /**
     * The Discord driver.
     * @type {Client}
     */
    this.driver = new Client(this.app.options.discord.options);

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();

    /**
     * The application commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.applicationCommands = new Collection();

    this.colorManager = new Collection();

    this.roleManager = new Collection();

    this.reactionRoles = new Collection();

    this.voiceRoles = new Collection();

    this.prefixes = new Collection();

    this.rooms = new Collection();

    this.randomSettings = new Collection();

    this.newMemberRoles = new Collection();

    this.musicData = new Collection();
  }

  /**
   * Initialize the manager.
   * @returns {Promise<string>}
   */
  async init() {
    this.attach();
    // Temporary Addition to handle interactions before discord.js does
    this.driver.ws.on('INTERACTION_CREATE', async packet => {
      const result = await interactionHandler(this.driver, packet);

      await this.driver.api.interactions(packet.id, packet.token).callback.post({
        data: result,
      });
    });
    // End addition

    Object.entries(commands).forEach(([command, handler]) => {
      this.commands.set(command, handler);
    });

    Object.entries(applicationCommands).forEach(([command, handler]) => {
      this.applicationCommands.set(command, handler);
    });

    await this.setCache();

    return this.driver.login(this.app.options.discord.token).catch(err => {
      this.app.log.out('error', module, `Login: ${err}`);
    });
  }

  /**
   * Cache all managers and music.
   * @returns {Promise<void>}
   */
  setCache() {
    return Promise.all([
      this.cache('roleManager', this.roleManager, 'guildID'),
      this.cache('colorManager', this.colorManager, 'guildID'),
      this.cache('reactionRoles', this.reactionRoles, 'guildID'),
      this.cache('voiceRoles', this.voiceRoles, 'guildID'),
      this.cache('prefixes', this.prefixes, 'guildID'),
      this.cache('randomChannels', this.randomSettings, 'guildID'),
      this.cache('newMemberRole', this.newMemberRoles, 'guildID'),
      this.cacheMusic(),
      this.cacheRooms(),
    ]).catch(err => {
      this.app.log.fatal('critical', module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the music data.
   * @returns {Promise<void>}
   */
  cacheMusic() {
    return this.app.database.get('volumes').then(volumes => {
      this.musicData.clear();
      volumes.forEach(volume => {
        if (this.musicData.get(volume.guildID)) {
          this.musicData.get(volume.guildID).volume = Number(volume.volume);
        } else {
          this.musicData.set(volume.guildID, { queue: [], isPlaying: false, nowPlaying: null, songDispatcher: null, volume: Number(volume.volume) });
        }
      });
    });
  }

  /**
   * Cache room data.
   * @returns {Promise<void>}
   */
  cacheRooms() {
    return this.app.database.get('rooms').then(rooms => {
      this.rooms.clear();
      let roomGuild, roomID;
      let guild;
      rooms.forEach(room => {
        [roomGuild, roomID] = room.guildRoomID.split('-');
        guild = this.rooms.get(roomGuild);
        if (!guild) {
          this.rooms.set(roomGuild, new Collection());
          guild = this.rooms.get(roomGuild);
        }
        guild.set(roomID, room.data);
      });
    });
  }

  /**
   * Query the database and set a given cache.
   * @param {string} method the database table to get
   * @param {Collection} map the map to store data in
   * @param {string} key a key to use for the new map
   * @param {string} [secondaryKey=false] a dashed key to use for the new map
   * @returns {Promise}
   */
  cache(method, map, key, secondaryKey = false) {
    return this.app.database.get(method).then(all => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }

  /**
   * Test a channel ID against the setting for the given key
   * @param {string} id the id of the channel to test
   * @param {string} key the channel name in settings to test against
   * @returns {boolean}
   */
  isChannel(id, key) {
    return id === this.app.settings.get(`discord_channel_${key}`);
  }

  /**
   * Test a guild ID against the setting for the given key
   * @param {string} id the id of the guild to test
   * @param {string} key the guild name in settings to test against
   * @returns {boolean}
   */
  isGuild(id, key) {
    return id === this.app.settings.get(`discord_guild_${key}`);
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
      this.app.log.out('warn', module, `Unknown content: ${transformer}`);
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
      this.app.log.out('warn', module, `Unknown embed: ${transformer}`);
      return null;
    }

    return transformer(new Composer(this.app.options), ...args);
  }

  /**
   * Send a message with the given content and embed.
   * @param {string} slug the channel name in settings to get and send to
   * @param {string|RichEmbed} content the content to send
   * @param {MessageOptions|Attachment|MessageEmbed} [embed] The options to provide
   */
  sendMessage(slug, content, embed) {
    const channel = this.getChannel(slug);

    if (!channel) {
      this.app.log.out('warn', module, `No channel set for slug: ${slug}`);
      return;
    }

    channel.send(content, embed).catch(err => {
      this.app.log.out('error', module, `Send message: ${err}`);
    });
  }

  /**
   * Send a webhook with the given content and embed.
   * @param {string} slug the webhook name in settings to get and send to
   * @param {string|RichEmbed} content the content to send
   * @param {WebhookMessageOptions|Attachment|MessageEmbed} [embed] The options to provide
   */
  sendWebhook(slug, content, embed) {
    this.getWebhook(slug).then(webhook => {
      if (!webhook) {
        this.app.log.out('warn', module, `No webhook set for slug: ${slug}`);
        return;
      }

      webhook.send(content, embed).catch(err => {
        this.app.log.out('error', module, `Send webhook: ${err}`);
      });
    });
  }
}

module.exports = DiscordManager;
