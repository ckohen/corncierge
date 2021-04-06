'use strict';

/**
 * Represents an interaction that can be triggered in discord
 * @abstract
 */
class BaseInteraction {
  /**
   * Data that defines an interaction
   * @typedef {Object} InteractionDefinition
   * @param {Object} definition the definition of the interaction (the data sent to discord)
   * @param {Snowflake|Snowflake[]} [guilds] register the interaction to specific guild(s)
   * @param {PermissionResolvable} [permissions] restrict the interaction to users with certain permissions
   */

  /**
   * Create a new interaction
   * @param {DiscordManager} socket the handler that will call the interaction
   * @param {InteractionData} data the data that defines the interaction
   */
  constructor(socket, data) {
    /**
     * The discord manager that calls this interaction
     * @name BaseInteraction#socket
     * @type {DiscordManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The definition of the interaction as discord expects it
     */
    Object.defineProperty(this, 'definition', { value: data.definition });

    /**
     * The base name for this interaction, pulled from the definition
     * @name BaseInteraction#name
     * @type {string}
     */
    Object.defineProperty(this, 'name', { value: data.definition?.name });

    if ('guilds' in data) {
      /**
       * The specific guild(s) this interaction is registered to, if not, global
       * @name BaseInteraction#guild
       * @type {Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'guilds', { value: data.guilds });
    }

    if ('permissions' in data) {
      /**
       * The permissions required to execute the interaction, if any
       * @name BaseInteraction#permissions
       * @type {?PermissionResolvable}
       */
      Object.defineProperty(this, 'permissions', { value: data.permissions });
    }
  }

  /**
   * Runs the command
   * @param {Interaction} interaction the interaction that was executed
   * @param {Object} options the options provided with this interaction
   * @abstract
   */
  run() {
    throw new Error('Must be implemented by subclass');
  }
}

module.exports = BaseInteraction;
