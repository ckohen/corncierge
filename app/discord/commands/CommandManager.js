'use strict';

const { Collection } = require('discord.js');
const BaseCommand = require('./BaseCommand');

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
     * The registered commands, mapped by name
     * @type {Collection<string, BaseCommand>}
     * @private
     */
    this.registered = new Collection();
  }

  /**
   * Registers built in commands
   * @private
   */
  registerBuiltIn() {
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
    if (!(handler instanceof BaseCommand)) throw new TypeError(`Discord commands must extend BaseCommand: ${command.name}`);
    if (this.socket.options.disabledCommands.includes(handler.name)) return;
    this.registered.set(handler.name, handler);
  }
}

module.exports = CommandManager;
