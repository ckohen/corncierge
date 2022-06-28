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
      this.registerGroup(require('./gaming'), 'gaming', true);
      this.registerGroup(require('./general'), 'general', true);
      this.registerGroup(require('./management'), 'management', true);
      this.registerGroup(require('./moderation'), 'moderation', true);
      this.registerGroup(require('./roles'), 'roles', true);
      this.registerGroup(require('./twitch'), 'twitch', true);
    }
  }

  /**
   * Registers a group of commands
   * @param {BaseCommand[]} commands the commands to register
   * @param {string} group the group to which this command resides (if disabledCommands includes this group name it will disable this command)
   * @param {boolean} [builtIn=false] whether this command is built in or not (used to disable commands, do not set this)
   */
  registerGroup(commands, group, builtIn = false) {
    if (builtIn && this.socket.options.disabledCommands.includes(group)) return;
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Registers a command in the manager for use throughout the application
   * @param {BaseCommand} command the command to register
   * @param {boolean} [builtIn = false] whether this command is built in or not (used to disable commands, do not set this)
   */
  register(command, builtIn = false) {
    const handler = new command(this.socket);
    if (!(handler instanceof BaseCommand)) throw new TypeError(`Discord commands must extend BaseCommand: ${command.name}`);
    if (builtIn && this.socket.options.disabledCommands.includes(handler.name)) return;
    this.registered.set(handler.name, handler);
  }
}

module.exports = CommandManager;
