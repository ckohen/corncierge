'use strict';

/**
 * Represents an interaction that can be triggered in discord
 * @abstract
 */
class BaseInteraction {
  /**
   * Data that defines an interaction
   * If restrictions are present they are checked in the following order:
   * * `Role`
   * * `Permissions`
   *
   *   e.g. if a command is executed and has role and permissions set, if the user sending does not have the role, it will not run
   * Restrictions on guild, channel, or user level should be done with discords built in methods.
   * If role names are not the appropriate way to handle your restriction needs, again use discords built in method.
   * @typedef {Object} InteractionData
   * @param {ApplicationCommandData|MessageComponentOptions|Function} [definition] the definition of the interaction (the data sent to discord)
   * @param {string} name the name of the interaction
   * @param {boolean} [requiresBot=false] whether the interaction needs a bot in the guild to function
   * @param {string} [role] restrict the interaction to a specific role (those with `Manage Roles` bypass this)
   * @param {PermissionResolvable} [permissions] restrict the interaction to users with certain permissions
   */

  /**
   * Create a new interaction
   * @param {DiscordManager} socket the handler that will call the interaction
   * @param {InteractionData} data the data that defines the interaction
   */
  constructor(socket, data) {
    if (typeof data !== 'object') throw new TypeError('The data to construct the intertaction must be an object');

    /**
     * The discord manager that calls this interaction
     * @name BaseInteraction#socket
     * @type {DiscordManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The base name for this interaction
     * @name BaseInteraction#name
     * @type {string}
     */
    Object.defineProperty(this, 'name', { value: data.name });

    /**
     * Whether the interaction needs a bot in the guild to function
     * @name BaseInteraction#requiresBot
     * @type {boolean}
     */
    Object.defineProperty(this, 'requiresBot', { value: data.requiresBot ?? false });

    /**
     * The definition of the interaction as discord expects it
     * @name BaseInteraction#definition
     * @type {ApplicationCommandData|MessageComponentOptions|Function}
     */
    Object.defineProperty(this, 'definition', { value: data.definition, writable: true });

    if ('permissions' in data) {
      /**
       * The permissions required to execute the interaction, if any
       * @name BaseInteraction#permissions
       * @type {?PermissionResolvable}
       */
      Object.defineProperty(this, 'permissions', { value: data.permissions });
    }

    if ('role' in data) {
      /**
       * The role this application command is restricted to, if any
       * @name BaseInteraction#role
       * @type {?string}
       */
      Object.defineProperty(this, 'role', { value: data.role });
    }
  }

  /**
   * Runs the command
   * @param {Interaction} interaction the interaction that was executed
   * @param {?CommandInteractionOptionResolver} [options] the options provided with this interaction
   * @abstract
   */
  run() {
    throw new Error('Must be implemented by subclass');
  }
}

module.exports = BaseInteraction;
