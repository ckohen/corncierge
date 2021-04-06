'use strict';

const { Collection } = require('discord.js');
const BaseInteraction = require('./BaseInteraction');
const applicationCommands = require('./applicationCommands');

/**
 * One of
 * * `applicationCommands`
 * @typedef {string} InteractionType
 */
const InteractionTypes = ['applicationCommands'];

/**
 * Stores the interactions for a discord manager
 */
class InteractionManager {
  constructor(socket) {
    /**
     * The discord manager that handles these commands
     * @name InteractionManager#socket
     * @type {DiscordManager}
     * @private
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The interactions by type
     * @typedef {Object} Interactions
     * @property {Collection<string, BaseAppCommand>} applicationCommands the appliction (slash) command interactions
     */

    /**
     * The registered interactions
     * @type {Interactions}
     * @private
     */
    this.registered = {
      applicationCommands: new Collection(),
    };
    this.registerMultiple(applicationCommands, 'applicationCommands');
  }

  /**
   * Registers a group of interactions
   * @param {BaseInteraction[]} interactions the interactions to register
   * @param {InteractionType} type the type of interaction to register as
   */
  registerMultiple(interactions, type) {
    for (const interaction of interactions) {
      this.register(interaction, type);
    }
  }

  /**
   * Registers an interaction in the manager for use throughout the application
   * @param {BaseInteraction} interaction the interaction to register
   * @param {string} type the type of the interaction
   */
  register(interaction, type) {
    const handler = new interaction(this.socket);
    if (!InteractionTypes.includes(type)) throw new RangeError(`Type ${type} is not a valid interaction type`);
    if (!(handler instanceof BaseInteraction)) throw new TypeError(`Discord interactions must extend BaseInteraction: ${interaction.name}`);
    this.registered[type].set(handler.name, handler);
  }
}

module.exports = InteractionManager;
