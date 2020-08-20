'use strict';

const { Collection } = require('discord.js');

const { collect } = require('./util/helpers');

const IrcManager = require('./irc/ircManager');

/**
 * The application container.
 * @version 1.1.0
 */
class Application {

  constructor(options = {}) {
    this.setOptions(options);

    /**
     * The IRC manager for the application.
     * @type {IrcManager}
     * @private
     */
    this.irc = new IrcManager(this);
  }

  /**
  * Boot the application.
  * @public
  */

  async boot() {
    // Run tasks in parallel to avoid serial delays
    await Promise.all([this.irc.init()]);
  }

  /**
   * Validate and set the configuration options for the application.
   * @param {Object} options
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
}

module.exports = Application;
