'use strict';

/**
 * Represents a command that can be triggered in discord
 * @abstract
 */
class BaseCommand {
  /**
   * Data that defines a command
   * Checks are done in the following order:
   * * `Guild`
   * * `Channel`
   * * `User`
   * * `Role`
   * * `Permissions`
   *
   *  e.g. if a command is executed and has role and channel set, if it is not sent in the channel specified, it will not run
   * @typedef {Object} CommandData
   * @param {string} name the name of the command (used to register the command as useable)
   * @param {string[]} [aliases] a list of aliases that can be used to call this command
   * @param {string} [description] what the command does
   * @param {string[]} [usage] an array of possible ways to use the command (for legacy help)
   * @param {string|Snowflake|Snowflake[]} [guild] restrict the command to a specific guild
   * @param {string|Snowflake|Snowflake[]} [channel] restrict the command to a specific channel (or set of channels if specified in database)
   * @param {string} [role] restrict the command to a specific role (those with `Manage Roles` bypass this)
   * @param {PermissionResolvable} [permissions] restrict the command to users with certain permissions
   * @param {string|Snowflake|Snowflake[]} [user] restrict the command to a specific user
   * @param {boolean} [args] whether arguments are required (set to false to provide a custom error message handled in command)
   */

  /**
   * Create a new command
   * @param {DiscordManager} socket the handler that will call the command
   * @param {CommandData} data the data that defines the command
   */
  constructor(socket, data) {
    if (typeof data !== 'object') throw new TypeError('The data to construct the command must be an object');

    /**
     * The discord manager that calls this command
     * @name BaseCommand#socket
     * @type {DiscordManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The base name for this command, how the command is called in discord (aside from aliases)
     * @name BaseCommand#name
     * @type {string}
     */
    Object.defineProperty(this, 'name', { value: data.name });

    if ('aliases' in data) {
      /**
       * The aliases for this command
       * @name BaseCommand#aliases
       * @type {?string[]}
       */
      Object.defineProperty(this, 'aliases', { value: data.aliases });
    }

    if ('description' in data) {
      /**
       * What this command does
       * @name BaseCommand#description
       * @type {?string}
       */
      Object.defineProperty(this, 'description', { value: data.description });
    }

    if ('usage' in data) {
      /**
       * The usage for this command
       * @name BaseCommand#usage
       * @type {?string[]}
       */
      Object.defineProperty(this, 'usage', { value: data.usage });
    }

    if ('guild' in data) {
      /**
       * The guild this command is restricted to, if any
       * @name BaseCommand#guild
       * @type {?string|Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'guild', { value: data.guild });
    }

    if ('channel' in data) {
      /**
       * The channel this command is restricted to, if any
       * @name BaseCommand#channel
       * @type {?string|Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'channel', { value: data.channel });
    }

    if ('role' in data) {
      /**
       * The role this command is restricted to, if any
       * @name BaseCommand#role
       * @type {?string}
       */
      Object.defineProperty(this, 'role', { value: data.role });
    }

    if ('permissions' in data) {
      /**
       * The permissions requied to use this command, if any
       * @name BaseCommand#permissions
       * @type {?PermissionResolvable}
       */
      Object.defineProperty(this, 'permissions', { value: data.permissions });
    }

    if ('user' in data) {
      /**
       * The user this command is restricted to, if any
       * @name BaseCommand#user
       * @type {?string|Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'user', { value: data.user });
    }

    if ('args' in data) {
      /**
       * Whether arguments are required for this command (false when handled by the the run function)
       * @name BaseCommand#args
       * @type {?boolean}
       */
      Object.defineProperty(this, 'args', { value: data.args });
    }
  }

  /**
   * Runs the command
   * @param {Message} message the message that executed the command
   * @param {string[]} args the content of the message split on spaces excluding the command name
   * @abstract
   */
  run() {
    throw new Error('Must be implemented by subclass');
  }
}

module.exports = BaseCommand;
