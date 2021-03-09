'use strict';

const { Collection } = require('discord.js');
const { RateLimiter } = require('limiter');
const { Client } = require('tmi.js');
const throttle = require('tokenthrottle');

const EventManager = require('./EventManager');
const TwitchCommandManager = require('../irc/commands/TwitchCommandManager');
const events = require('../irc/events');
const { collect } = require('../util/UtilManager');

const thirtySecs = 30000;

/**
 * IRC manager for the application.
 * @extends {EventManager}
 */
class IrcManager extends EventManager {
  constructor(app, twitch) {
    if (!twitch.options.irc.identity?.password && twitch.options.irc.identity) {
      twitch.options.irc.identity.password = twitch.auth.getAccessToken.bind(twitch.auth);
    }
    super(app, new Client(twitch.options.irc), twitch.options.irc, events);

    /**
     * The IRC Client.
     * @type {tmi.js.Client}
     * @name IrcManager#driver
     */

    /**
     * The Twitch manager that instantiated this.
     * @name IrcManager#twitch
     * @type {TwitchManager}
     * @readonly
     */
    Object.defineProperty(this, 'twitch', { value: twitch });

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
     * The command manager that stores specially handled commands
     * @type {TwitchCommandManager}
     */
    this.specialCommands = new TwitchCommandManager(this);

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
    this.throttle = throttle(this.twitch.options.throttle);
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  async init() {
    const cp = await this.setCache();

    this.app.log.debug(module, 'Registering events');
    this.attach();
    this.app.log.debug(module, 'Connecting');
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
    this.app.database.tables.botLog.add(values);
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
    this.app.log.debug(module, 'Caching jokes');
    return this.app.database.tables.jokes.get().then(all => {
      this.jokes.length = 0;
      all.forEach(item => this.jokes.push(item));
    });
  }

  /**
   * Cache the moderation filters.
   * @returns {Promise<void>}
   */
  cacheFilters() {
    this.app.log.debug(module, 'Caching filters');
    return this.cache('ircFilters', this.filters, 'id');
  }

  /**
   * Cache the commands.
   * @returns {Promise<void>}
   */
  cacheCommands() {
    this.app.log.debug(module, 'Caching commands');
    return this.cache('ircCommands', this.commands, 'input', 'prefix');
  }

  /**
   * Query the database and set a given cache.
   * @param {string} table the database table to get
   * @param {Collection} map the map to store data in
   * @param {string} [key] a key to use for the new map
   * @param {string} [secondaryKey=false] a dashed key to use for the new map
   * @returns {Promise<void>}
   */
  cache(table, map, key, secondaryKey = false) {
    return this.app.database.tables[table].get().then(all => {
      map.clear();
      collect(map, all, key, secondaryKey);
    });
  }
}

module.exports = IrcManager;