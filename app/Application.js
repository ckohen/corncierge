'use strict';

const { Collection } = require('discord.js');

const ApiManager = require('./api/ApiManager');
const AuthManager = require('./api/AuthManager');
const DatabaseManager = require('./database/DatabaseManager');
const DiscordManager = require('./discord/DiscordManager');
const HTTPManager = require('./http/HTTPManager');
const IrcManager = require('./irc/IrcManager');
const LogManager = require('./log/LogManager');
const logBuilder = require('./log/LogRouter');
const { collect } = require('./util/helpers');

/**
 * The application container.
 * @version 1.1.0
 */
class Application {
  /**
   * Create a new application instance.
   * @param {Object} [options={}] the options to provide to the application
   * @public
   */
  constructor(options = {}) {
    this.setOptions(options);

    /**
     * Whether the application is in debug mode.
     * @type {boolean}
     * @private
     */
    this.debug = this.options.app.debug === 'true';

    /**
     * The API manager for the application.
     * @type {ApiManager}
     * @private
     */
    this.api = new ApiManager(this);

    /**
     * The Authentication manager for the application.
     * @type {AuthManager}
     * @private
     */
    this.auth = new AuthManager(this);

    /**
     * The IRC manager for the application.
     * @type {IrcManager}
     * @private
     */
    this.irc = new IrcManager(this);

    /**
     * The log manager for the application.
     * @type {LogManager}
     * @private
     */
    this.logger = new LogManager(this);

    /**
     * The settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     * @private
     */
    this.settings = new Collection();

    /**
     * The streaming settings for the application, mapped by name.
     * @type {Collection<string, Object>}
     * @private
     */
    this.streaming = new Collection();

    /**
     * The Discord manager for the application.
     * @type {DiscordManager}
     * @private
     */
    this.discord = new DiscordManager(this);

    /**
     * The HTTP Server manager for the application.
     * @type {HTTPManager}
     * @private
     */
    this.http = new HTTPManager(this);

    /**
     * The database manager for the application.
     * @type {DatabaseManager}
     * @private
     */
    this.database = new DatabaseManager(this);

    /**
     * True when intentionally ending the application so subapplications do not restart
     * @type {Boolean}
     * @private
     */
    this.ending = false;
  }

  /**
   * A level of logging based on the following:
   * * fatal - a critical error that ends the application
   * * critical - potentially breaking issue
   * * error - high priority non-breaking issue
   * * warn - non-breaking issue
   * * info - general information
   * * debug - highly detailed debug information
   * * verbose - clutters the log
   * @typedef {string} LogLevel
   */

  /**
   * Logging shortcut. Logs to `info` by default. Other levels are properties.
   * @type {Logging}
   * @property {LogLevel} level the level of log to make
   * @property {function({Module, string})} log output the log with these parameters
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

    await Promise.all([this.discord.init(), this.irc.init()]);
    await this.http.init();

    this.log(module, 'Boot complete');
    // Send "Ready" to parent if it exists
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  }

  async end(code) {
    this.ending = true;
    try {
      await this.irc.driver.disconnect();
      await this.discord.driver.destroy();
      await this.http.driver.close();
    } catch (err) {
      this.log.error(module, `Error when shutting down: ${err}`);
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
    if (Object.keys(options).length === 0 && options.constructor === Object) {
      throw new TypeError('The application must be provided with an options object.');
    }

    this.options = options;
    this.options.basepath = __dirname;
  }

  /**
   * Cache all database settings for the application.
   * @returns {Promise}
   * @private
   */
  setSettings() {
    return this.database
      .get('settings')
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
    return this.database
      .get('streaming')
      .then(all => collect(this.streaming, all, 'name', null))
      .catch(err => {
        this.log.fatal(module, `Streaming Settings: ${err}`);
      });
  }
}

module.exports = Application;
