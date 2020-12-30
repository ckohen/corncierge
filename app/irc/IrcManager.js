'use strict';

const { Collection } = require('discord.js');
const { RateLimiter } = require('limiter');
const { Client } = require('tmi.js');
const throttle = require('tokenthrottle');

const events = require('./events');
const EventManager = require('../managers/EventManager');
const { collect } = require('../util/helpers');

const thirtySecs = 30000;

/**
 * IRC manager for the application.
 * @extends {EventManager}
 */
class IrcManager extends EventManager {
  constructor(app) {
    app.options.irc.identity.password = app.auth.getAccessToken.bind(app.auth);
    super(app, new Client(app.options.irc), app.options.irc, events);

    /**
     * The IRC Client.
     * @type {Client}
     * @name IrcManager#driver
     */

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

    this.attach();
    this.driver.connect();

    return cp;
  }

  /**
   * Send a message.
   * @param {string} channel the twitch channel to post in
   * @param {string} message the message to post
   */
  say(channel, message) {
    if (!message) return;
    this.limiter.removeTokens(1, () => {
      this.driver.say(channel, message);
    });
  }

  /**
   * Send a command to delete the given message.
   * @param {string} channel the twitch channel to delete from
   * @param {string} uuid the unique id of the message
   * @param {Function} [callback] called after succesfull deletion
   */
  delete(channel, uuid, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver
        .deletemessage(channel, uuid)
        .then(() => {
          if (typeof callback !== 'function') return;
          callback();
        })
        .catch(err => {
          this.app.log.error(module, `Delete: ${err}`);
        });
    });
  }

  /**
   * Time a user out for the given duration.
   * @param {string} channel the twitch channel to timeout in
   * @param {string} username the twitch name to timeout
   * @param {number} duration the duration of the timeout
   * @param {Function} [callback] called after succesfull timeout
   */
  timeout(channel, username, duration, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver
        .timeout(channel, username, duration)
        .then(() => {
          if (typeof callback !== 'function') return;
          callback();
        })
        .catch(err => {
          this.app.log.error(module, `Timeout: ${err}`);
        });
    });
  }

  /**
   * Ban a user.
   * @param {string} channel the twitch channel to ban in
   * @param {string} username the twitch user to ban
   * @param {Function} [callback] called after succesfull ban
   */
  ban(channel, username, callback = null) {
    this.limiter.removeTokens(1, () => {
      this.driver
        .ban(channel, username)
        .then(() => {
          if (typeof callback !== 'function') return;
          callback();
        })
        .catch(err => {
          this.app.log.error(module, `Ban: ${err}`);
        });
    });
  }

  /**
   * Log a moderation action to the database.
   * @param {...*} values the extra arguments to log
   */
  logModeration(...values) {
    this.app.database.add('botLog', values);
  }

  /**
   * Cache all moderation filters, commands, and jokes.
   * @returns {Promise}
   */
  setCache() {
    return Promise.all([this.cacheJokes(), this.cacheFilters(), this.cacheCommands()]).catch(err => {
      this.app.log.fatal(module, `Cache: ${err}`);
    });
  }

  /**
   * Cache the jokes.
   * @returns {Promise<void>}
   */
  cacheJokes() {
    return this.app.database.get('jokes').then(all => {
      this.jokes.length = 0;
      all.forEach(item => this.jokes.push(item));
    });
  }

  /**
   * Cache the moderation filters.
   * @returns {Promise<void>}
   */
  cacheFilters() {
    return this.cache('ircFilters', this.filters, 'id');
  }

  /**
   * Cache the commands.
   * @returns {Promise<void>}
   */
  cacheCommands() {
    return this.cache('ircCommands', this.commands, 'input', 'prefix');
  }

  /**
   * Query the database and set a given cache.
   * @param {string} method the database table to get
   * @param {Collection} map the map to store data in
   * @param {string} [key] a key to use for the new map
   * @param {string} [secondaryKey=false] a dashed key to use for the new map
   * @returns {Promise<void>}
   */
  cache(method, map, key, secondaryKey = false) {
    return this.app.database.get(method).then(all => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }
}

module.exports = IrcManager;
