'use strict';

const BaseInteraction = require('../BaseInteraction');

/**
 * Represents an application command that can be triggered in discord
 * @abstract
 */
class BaseAppCommand extends BaseInteraction {
  /**
   * Data that defines an application command interaction
   * Channel restrictions are checked before the other two restriction checks.
   *
   * Restrictions on guild or user level should be done with discords built in method.
   * If role names are not the appropriate way to handle your restriction needs, again use discords built in method.
   * <info> `data.name` is pulled from the definition on application commands </info>
   * @typedef {InteractionData} AppCommandData
   * @param {string|Snowflake|Snowflake[]} [channel] restrict the command to a specific channel (or set of channels if specified in database)
   * @param {Snowflake|Snowflake[]} [guilds] register the interaction to specific guild(s)
   */

  /**
   * Create a new interaction
   * @param {DiscordManager} socket the handler that will call the interaction
   * @param {AppCommandData} data the data that defines the interaction
   */
  constructor(socket, data) {
    super(socket, { ...data, name: data.definition.name });
    if ('channel' in data) {
      /**
       * The channel this application command is restricted to, if any
       * @name BaseAppCommand#channel
       * @type {?string|Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'channel', { value: data.channel });
    }

    if ('guilds' in data) {
      /**
       * The specific guild(s) this interaction is registered to, if not, global
       * @name BaseAppCommand#guild
       * @type {?Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'guilds', { value: data.guilds });
    }

    /**
     * The definition of the interaction as discord expects it
     * @name BaseAppCommand#definition
     * @type {ApplicationCommandData|Function}
     */
  }
}

module.exports = BaseAppCommand;
