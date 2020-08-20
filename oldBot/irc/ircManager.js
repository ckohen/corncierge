const events = require('./events');
const Socket = require('../socket');
const { Collection } = require('discord.js');
const { collect } = require('../util/helpers');
const { client: Client } = require('tmi.js');

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
   * The moderation filters for the socket, mapped by ID.
   * @type {Collection<number, Object>}
   */
    this.filters = new Collection();
    /**
     * The IRC driver.
     * @type {Client}
     */
    this.driver = new Client(this.app.options.irc);

    /**
     * The commands for the socket, mapped by input.
     * @type {Collection<string, Object>}
     */
    this.commands = new Collection();

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
      });
    });
  }
}

module.exports = IrcManager;