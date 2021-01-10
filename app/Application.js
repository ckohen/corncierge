'use strict';

const { Collection } = require('discord.js');

const DatabaseManager = require('./managers/DatabaseManager');
const DiscordManager = require('./managers/DiscordManager');
const HTTPManager = require('./managers/HTTPManager');
const LogManager = require('./managers/LogManager');
const TwitchManager = require('./managers/TwitchManager');
const Constants = require('./util/Constants');
const logBuilder = require('./util/LogRouter');
const { collect, mergeDefault } = require('./util/UtilManager');

/**
 * The application container.
 * @version 1.1.0
 */
class Application {
  /**
   * Create a new application instance.
   * @param {ApplicationOptions} [options] the options for the application
   * @public
   */
  constructor(options = {}) {
    this.setOptions(options);

    /**
     * Whether the application is in debug mode.
     * @type {boolean}
     * @private
     */
    this.debug = this.options.debug;

    /**
     * The Twitch manager for the application.
     * @type {TwitchManager}
     */
    this.twitch = new TwitchManager(this);

    /**
     * The log manager for the application.
     * @type {LogManager}
     * @private
     */
    this.logger = new LogManager(this);

    /**
     * The settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     */
    this.settings = new Collection();

    /**
     * The streaming settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     */
    this.streaming = new Collection();

    /**
     * The Discord manager for the application.
     * @type {DiscordManager}
     */
    this.discord = new DiscordManager(this);

    /**
     * The HTTP Server manager for the application.
     * @type {HTTPManager}
     */
    this.http = new HTTPManager(this);

    /**
     * The database manager for the application.
     * @type {DatabaseManager}
     */
    this.database = new DatabaseManager(this);

    /**
     * True when intentionally ending the application so subapplications do not restart
     * @type {boolean}
     * @private
     */
    this.ending = false;
  }

  /**
   * Logging shortcut. Logs to `info` by default. Other levels are properties.
   * @type {Logging}
   * @readonly
   */
  get log() {
    return logBuilder(this);
  }

  /**
   * Boot the application.
   * @public
   */
  async boot() {
    // Run tasks in parallel to avoid serial delays
    await Promise.all([this.setSettings(), this.setStreaming()]);
    this.log.debug(module, 'All settings Initialized.');

    await Promise.all([this.discord.init(), this.twitch.irc.init(), this.http.init()]);

    this.log(module, 'Boot complete');
    // Send "Ready" to parent if it exists
    if (typeof process.send === 'function') {
      process.send('ready');
      this.log.debug(module, 'Sent ready to parent');
    }
  }

  async end(code) {
    this.log.debug(module, `Shutting Down`);
    this.ending = true;
    try {
      await this.twitch.irc.driver.disconnect();
      await this.discord.driver.destroy();
      await this.http.driver.close();
    } catch (err) {
      this.log.debug(module, `Error when shutting down: ${err}`);
    }
    process.exit(code);
  }

  /**
   * Validate and set the configuration options for the application.
   * @param {Object} options the options to validate
   * @throws {TypeError}
   * @private
   */
  setOptions(options) {
    const merged = mergeDefault(Constants.DefaultOptions, options);
    if (typeof merged.database !== 'object') {
      throw new TypeError('The database option must be an object');
    } else {
      if (typeof merged.database.database !== 'string') throw new TypeError('The database target must be a string');
      if (typeof merged.database.host !== 'string') throw new TypeError('The database host must be a string');
      if (typeof merged.database.password !== 'string') {
        if ('DATABASE_PASSWORD' in process.env) {
          merged.database.password = process.env.DATABASE_PASSWORD;
        } else {
          throw new TypeError('The database password must be a string');
        }
      }
      if (typeof merged.database.port !== 'number') throw new TypeError('The database port must be a number');
      if (typeof merged.database.timezone !== 'string') throw new TypeError('The database timezone must be a string');
      if (typeof merged.database.user !== 'string') {
        if ('DATABASE_USER' in process.env) {
          merged.database.user = process.env.DATABASE_USER;
        } else {
          throw new TypeError('The database user must be a string');
        }
      }
    }
    if (typeof merged.debug !== 'boolean') throw new TypeError('Debug must be a boolean');
    if (typeof merged.disableDiscord !== 'boolean') throw new TypeError('Disable Discord must be a boolean');
    if (typeof merged.disableIRC !== 'boolean') throw new TypeError('Disable IRC must be a boolean');
    if (typeof merged.disableServer !== 'boolean') throw new TypeError('Disable Server must be a boolean');
    if (typeof merged.disableTwitch !== 'boolean') throw new TypeError('Disable Twitch must be a boolean');
    if (!merged.disableDiscord && typeof merged.discord !== 'object') {
      throw new TypeError('The discord option must be provided when discord is not disabled');
    } else {
      if (typeof merged.discord.clientOptions !== 'object') throw new TypeError('The discord client options must be an object');
      if (!Array.isArray(merged.discord.disabledCommands)) throw new TypeError('Disabled commands must be an array');
      if (typeof merged.discord.token !== 'string') {
        if ('DISCORD_TOKEN' in process.env) {
          merged.discord.token = process.env.DISCORD_TOKEN;
        } else {
          throw new TypeError('The discord bot token must be a string');
        }
      }
      if (!merged.discord.disabledCommands.includes('music') && !merged.discord.disabledCommands.includes('all') && typeof merged.youtubeToken !== 'string') {
        if ('YOUTUBE_TOKEN' in process.env) {
          merged.youtubeToken = process.env.YOUTUBE_TOKEN;
        } else {
          throw new TypeError('The Youtube token must be a string if music commands are enabled');
        }
      }
    }
    if (!merged.disableServer && typeof merged.http !== 'object') {
      throw new TypeError('The http option must be an object when server is not disabled');
    }
    if (typeof merged.log !== 'object') {
      throw new TypeError('The log option must be an object');
    } else {
      if (typeof merged.log.maxLevel !== 'string') throw new TypeError('The max level option must be a string');
      if (typeof merged.log.outputFile !== 'string') throw new TypeError('The output file path must be a string');
      if (typeof merged.log.verbose !== 'boolean') throw new TypeError('The verbose toggle must be a boolean');
      if (typeof merged.log.webhookBase !== 'string') throw new TypeError('The webhook base url must be a string');
      if (!merged.disableDiscord && typeof merged.log.webhookToken !== 'string') {
        if ('LOG_WEBHOOK_TOKEN' in process.env) {
          merged.log.webhookToken = process.env.LOG_WEBHOOK_TOKEN;
        } else {
          throw new TypeError('The webhook token must be a string');
        }
      }
    }
    if (typeof merged.http.port !== 'number') throw new TypeError('The HTTP port must be a number');
    if (!merged.disableTwitch && typeof merged.twitch !== 'object') {
      throw new TypeError('The twitch option must be an object when twitch is not disabled');
    } else {
      if (typeof merged.twitch.api !== 'string') throw new TypeError('The base api url must be a string');
      if (typeof merged.twitch.authapi !== 'string') throw new TypeError('The base auth api url must be a string');
      if (merged.twitch.botCode && typeof merged.twitch.botCode !== 'string') throw new TypeError('The bot auth code must be a string');
      if (merged.twitch.channel?.id && typeof merged.twitch.channel.id !== 'string') throw new TypeError('The default channel id must be a string');
      if (merged.twitch.channel?.name && typeof merged.twitch.channel.name !== 'string') throw new TypeError('The default channel name must be a string');
      if (typeof merged.twitch.clientID !== 'string') {
        if ('TWITCH_CLIENT_ID' in process.env) {
          merged.twitch.clientID = process.env.TWITCH_CLIENT_ID;
        } else {
          throw new TypeError('The twitch client id must be a string');
        }
      }
      if (typeof merged.twitch.clientSecret !== 'string') {
        if ('TWITCH_CLIENT_SECRET' in process.env) {
          merged.twitch.clientSecret = process.env.TWITCH_CLIENT_SECRET;
        } else {
          throw new TypeError('The twitch client secret must be a string');
        }
      }
      if (typeof merged.twitch.redirectUri !== 'string') throw new TypeError('The twitch redirect uri must be a string');
      if (!merged.disableIRC && typeof merged.twitch.irc !== 'object') throw new TypeError('The IRC option must be an object when IRC is not disabled');
      if (!merged.disableIRC && typeof merged.twitch.ircThrottle !== 'object') {
        throw new TypeError('The IRC throttler must be an object when IRC is not disabled');
      }
    }

    this.options = this.formatOptions(merged);
    this.options.basepath = __dirname;
  }

  /**
   * Formats options in a useable format for the application
   * @param {Object} options the pre validated options
   * @returns {Object} formatted options
   * @private
   */
  formatOptions(options) {
    const formatted = {
      debug: options.debug,
      disableDiscord: options.disableDiscord,
      disableIRC: options.disableIRC,
      disableServer: options.disableServer,
      disableTwitch: options.disableTwitch,
      database: options.database,
      log: options.log,
    };
    if (!options.disableDiscord) {
      formatted.discord = options.discord;
    }
    if (!options.disableServer) {
      formatted.http = options.http;
    }
    if (!options.disableTwitch) {
      formatted.twitch = {
        apiConfig: {
          baseURL: options.twitch.api,
          headers: {
            'Client-ID': options.twitch.clientID,
            ...options.twitch.headers,
          },
        },
        auth: {
          redirectUri: options.twitch.redirectUri,
          apiConfig: {
            baseURL: options.twitch.authapi,
          },
          botCode: options.twitch.botCode,
          clientID: options.twitch.clientID,
          clientSecret: options.twitch.clientSecret,
        },
        commandPrefix: '!',
      };
      if (options.twitch.channel) {
        formatted.twitch.channel = {
          id: options.twitch.channel.id,
          name: options.twitch.channel.name,
        };
      }
      if (!options.disableIRC) {
        formatted.twitch.irc = options.twitch.irc;
        formatted.twitch.throttle = options.twitch.ircThrottle;
      }
    }
    if (options.youtubeToken) {
      formatted.youtube = { token: options.youtubeToken };
    }
    return formatted;
  }

  /**
   * Cache all database settings for the application.
   * @returns {Promise}
   * @private
   */
  setSettings() {
    this.log.debug(module, 'Initializing Settings.');
    return this.database.tables.settings
      .get()
      .then(all => collect(this.settings, all, 'name', null, 'value'))
      .catch(err => {
        this.log.fatal(module, `Settings: ${err}`);
      });
  }

  /**
   * Cache all database streaming settings for the application.
   * @returns {Promise}
   * @private
   */
  setStreaming() {
    this.log.debug(module, 'Initializing Streaming Settings.');
    return this.database.tables.streaming
      .get()
      .then(all => collect(this.streaming, all, 'name', null))
      .catch(err => {
        this.log.fatal(module, `Streaming Settings: ${err}`);
      });
  }
}

module.exports = Application;
