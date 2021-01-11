'use strict';

const { Collection } = require('discord.js');

/**
 * Stores the commands for a discord manager
 * Commands that are disabled are not registered
 */
class CommandManager {
  constructor(socket) {
    /**
     * The discord manager that handles these commands
     * @name CommandManager#socket
     * @type {DiscordManager}
     * @private
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * An array of all registered commands
     * @type {Collection<string, BaseCommand>}
     */
    this.registered = new Collection();

    if (!this.socket.options.disabledCommands.includes('all')) {
      this.registerGroup(require('./gaming'), 'gaming');
      this.registerGroup(require('./general'), 'general');
      this.registerGroup(require('./management'), 'management');
      this.registerGroup(require('./moderation'), 'moderation');
      this.registerGroup(require('./music'), 'music');
      this.registerGroup(require('./roles'), 'roles');
      this.registerGroup(require('./twitch'), 'twitch');
    }
  }

  /**
   * Registers a group of commands
   * @param {BaseCommand[]} commands the commands to register
   * @param {string} group the group to which this command resides (if disabledCommands includes this group name it will disable this command)
   * @private
   */
  registerGroup(commands, group) {
    if (this.socket.options.disabledCommands.includes(group)) return;
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Registers a command in the manager for use throughout the application
   * @param {BaseCommand} command the command to register
   */
  register(command) {
    const handler = new command(this.socket);
    if (this.socket.options.disabledCommands.includes(handler.name)) return;
    this.registered.set(handler.name, handler);
  }
}

module.exports = CommandManager;
