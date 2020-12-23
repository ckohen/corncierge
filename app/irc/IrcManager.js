'use strict';

const throttle = require('tokenthrottle');
const { RateLimiter } = require('limiter');
const { client: Client } = require('tmi.js');
const { Collection } = require('discord.js');

const events = require('./events');
const Socket = require('../Socket');
const { collect } = require('../util/helpers');

const thirtySecs = 30000;

/**
 * IRC manager for the application.
 * @extends {Socket}
 * @private
 */
class IrcManager extends Socket {
  /**
   * Create a new IRC manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    super();

    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The socket events.
     * @type {Object}
     */
    this.events = events;

    /**
     * The jokes for the IRC joke command.
     * @type {Array<Object>}
     */
    this.jokes = [];

    /**
     * The moderation filters for the socket, mapped by ID.
     * @type {Collection<number, Object>}
     */
    this.filters = new Collection();

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();

    /**
     * The options for the client
     * @type {Object}
     */
    this.options = this.app.options.irc;
    
    /**
     * The rate limiter.
     * Twitch IRC only allows 100 requests every 30 seconds.
     * @type {RateLimiter}
     */
    this.limiter = new RateLimiter(95, thirtySecs);

    /**
     * The command throttle.
     * @type {Throttle}
     */
    this.throttle = throttle(this.app.options.throttle);

    /**
     * The moderation filter types.
     * @type {Object}
     */
    this.filterTypes = {
      BAN: 1,
      TIMEOUT: 2,
      DELETE: 3,
      WARNING: 4,
      REVIEW: 5,
    };
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  async init() {
    const cp = await this.setCache();
    this.options.identity.password = await this.app.auth.getAccessToken(this.options.identity.username.slice(1, -1));

    /**
     * The IRC driver.
     * @type {Client}
     */
    this.driver = new Client(this.options);

    this.attach();
    this.driver.connect();

    return cp;
  }

  /**
   * Reinitializes the driver with a new token
   * @param {string} token 
   */
  async setDriver(token) {
    this.options.identity.password = `oauth:${token}`;
    this.driver = new Client(this.options);
    this.attach();
    this.driver.connect();
  }

  /**
   * Send a message.
   * @param {string} channel
   * @param {string} message
   */
  say(channel, message) {
    if (!message) return;
    this.limiter.removeTokens(1, () => {
      this.driver.say(channel, message);
    });
  }

  /**
   * Send a command to delete the given message.
   * @param {string} channel
   * @param {string} uuid
   * @param {Function} [callback]
   */
  delete(channel, uuid, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver.deletemessage(channel, uuid).then(() => {
        if (typeof callback !== 'function') return;
        callback();
      }).catch((err) => {
        this.app.log.out('error', module, `Delete: ${err}`);
      });
    });
  }

  /**
   * Time a user out for the given duration.
   * @param {string} channel
   * @param {string} username
   * @param {number} duration
   * @param {Function} [callback]
   */
  timeout(channel, username, duration, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver.timeout(channel, username, duration).then(() => {
        if (typeof callback !== 'function') return;
        callback();
      }).catch((err) => {
        this.app.log.out('error', module, `Timeout: ${err}`);
      });
    });
  }

  /**
   * Ban a user.
   * @param {string} channel
   * @param {string} username
   * @param {Function} [callback]
   */
  ban(channel, username, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver.ban(channel, username).then(() => {
        if (typeof callback !== 'function') return;
        callback();
      }).catch((err) => {
        this.app.log.out('error', module, `Ban: ${err}`);
      });
    });
  }

  /**
   * Log a moderation action to the database.
   * @param {...*} values
   */
  logModeration(...values) {
    this.app.database.add('botLog', values);
  }

  /**
   * Cache all moderation filters, commands, and jokes.
   * @returns {Promise}
   */
  setCache() {
    return Promise.all([
      this.cacheJokes(),
      this.cacheFilters(),
      this.cacheCommands(),
    ]).catch((err) => {
      this.app.log.fatal('critical', module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the jokes.
   * @returns {Promise}
   */
  cacheJokes() {
    return this.app.database.get('jokes').then((all) => {
      this.jokes.length = 0;
      all.forEach((item) => this.jokes.push(item));
    });
  }

  /**
   * Cache the moderation filters.
   * @returns {Promise}
   */
  cacheFilters() {
    return this.cache('ircFilters', this.filters, 'id');
  }

  /**
   * Cache the commands.
   * @returns {Promise}
   */
  cacheCommands() {
    return this.cache('ircCommands', this.commands, 'input', 'prefix');
  }

  /**
   * Query the database and set a given cache.
   * @param {string} method
   * @param {Collection} map
   * @param {string} key
   * @returns {Promise}
   */
  cache(method, map, key, secondaryKey = false) {
    return this.app.database.get(method).then((all) => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }
}

module.exports = IrcManager;
