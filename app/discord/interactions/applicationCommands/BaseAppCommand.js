'use strict';

const BaseInteraction = require('../BaseInteraction');

/**
 * Represents an application commandthat can be triggered in discord
 * @abstract
 */
class BaseAppCommand extends BaseInteraction {
  /**
   * Data that defines an application command interaction
   * If restrictions are present they are checked in the following order:
   * * `Channel`
   * * `Role`
   * * `Permissions`
   *
   *  e.g. if a command is executed and has role and channel set, if it is not sent in the channel specified, it will not run
   *
   * Restrictions on guild or user level should be done with discords built in method.
   * If role names are not the appropriate way to handle your restriction needs, again use discords built in method.
   * @typedef {Object} AppplicationCommandData
   * @param {Object} definition the definition of the interaction (the data sent to discord)
   * @param {Snowflake|Snowflake[]} [guilds] register the interaction to specific guild(s)
   * @param {PermissionResolvable} [permissions] restrict the interaction to users with certain permissions
   */

  /**
   * Create a new interaction
   * @param {DiscordManager} socket the handler that will call the interaction
   * @param {AppplicationCommandData} data the data that defines the interaction
   */
  constructor(socket, data) {
    super(socket, data);
    if ('channel' in data) {
      /**
       * The channel this application command is restricted to, if any
       * @name BaseAppCommand#channel
       * @type {?string|Snowflake|Snowflake[]}
       */
      Object.defineProperty(this, 'channel', { value: data.channel });
    }

    if ('role' in data) {
      /**
       * The role this application command is restricted to, if any
       * @name BaseAppCommand#role
       * @type {?string}
       */
      Object.defineProperty(this, 'role', { value: data.role });
    }
  }
}

module.exports = BaseAppCommand;
