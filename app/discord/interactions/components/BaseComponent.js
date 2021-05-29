'use strict';

const BaseInteraction = require('../BaseInteraction');

/**
 * Represents a component that can be triggered in discord
 * @abstract
 */
class BaseComponent extends BaseInteraction {
  /**
   * Data that defines a component interaction
   * @typedef {InteractionData} ComponentData
   */
  /**
   * Create a new interaction
   * @param {DiscordManager} socket the handler that will call the interaction
   * @param {ComponentData} data the data that defines the interaction
   */
}

module.exports = BaseComponent;
