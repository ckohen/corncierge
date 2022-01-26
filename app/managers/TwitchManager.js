'use strict';

const EventManager = require('./EventManager');
const IrcManager = require('./IrcManager');
const events = require('../twitch/events');
const { TwitchClient } = require('../twitchlib');

/**
 * Twitch manager for the application.
 * @extends {EventManager}
 */
class TwitchManager extends EventManager {
  constructor(app) {
    super(app, new TwitchClient(app.options.twitch), app.options.twitch, events);

    /**
     * The Twitch API Client.
     * @type {TwitchClient}
     * @name TwitchManager#driver
     */

    if (!app.options.disableIRC) {
      /**
       * The IRC manager for the application.
       * @type {IrcManager}
       */
      this.irc = new IrcManager(app, this);
    }
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  async init() {
    await Promise.all([this.irc?.init(), this.driver.auth.setDatabaseAccessor(this.app.database.tables.twitchAuth)]);
  }

  /**
   * Destroys assets used by the manager
   * @returns {Promise}
   */
  async destroy() {
    await this.irc.driver.disconnect().catch(err => this.app.log.debug(module, err));
    await this.driver.destroy();
  }
}

module.exports = TwitchManager;
