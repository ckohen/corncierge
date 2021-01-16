'use strict';

const { Collection } = require('discord.js');
const TwitchCommand = require('./TwitchCommand');

/**
 * Stores the commands for an IRC manager
 */
class TwitchCommandManager {
  constructor(socket) {
    /**
     * The IRC manager that handles these commands
     * @name TwitchCommandManager#socket
     * @type {IrcManager}
     * @private
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The registered commands, mapped by name
     * @type {Collection<string, TwitchCommand>}
     */
    this.registered = new Collection();

    this.register(require('./followage'));
    this.register(require('./joke'));
    this.register(require('./myforehead69'));
    this.register(require('./poki'));
    this.register(require('./uptime'));
  }

  /**
   * Registers a command in the manager for use throughout the application
   * @param {TwitchCommand} command the command to register
   */
  register(command) {
    const handler = new command(this.socket);
    if (!(handler instanceof TwitchCommand)) throw new TypeError(`Twitch commands must extend TwitchCommand: ${command.name}`);
    this.registered.set(handler.name, handler);
  }
}

module.exports = TwitchCommandManager;
