'use strict';

/**
 * Represents a command that can be triggered in twitch
 * @abstract
 */
class TwitchCommand {
  /**
   * Data that defines a Twitch command
   * @typedef {Object} TwitchCommandData
   * @param {string} name the name of the command (used to register the command as useable)
   */

  /**
   * Create a new command
   * @param {IrcManager} socket the IRC that will call the command
   * @param {TwitchCommandData} data the data that defines the command
   */
  constructor(socket, data) {
    /**
     * The twitch manager that calls this command
     * @name TwitchCommand#socket
     * @type {IrcManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The base name for this command, how the command is called in discord (aside from aliases)
     * @name TwitchCommand#name
     * @type {string}
     */
    Object.defineProperty(this, 'name', { value: data.name });
  }

  /**
   * Runs the command
   * @function TwitchCommand#run
   * @param {CommandHandler} handler the handler that handles interacting with the socket
   * @param {boolean} hasArgsMod whether the command has arguments and the user is privileged
   * @returns {Promise<boolean>} whether the command has been successfully handled
   * @abstract
   */
}

module.exports = TwitchCommand;
