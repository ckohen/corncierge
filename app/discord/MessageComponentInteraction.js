'use strict';

const { WebhookClient } = require('discord.js');
const Interaction = require('./Interaction');
const InteractionResponses = require('./InteractionResponses');

const MessageComponentTypes = {
  ACTION_ROW: 1,
  BUTTON: 2,
  1: 'ACTION_ROW',
  2: 'BUTTON',
};

/**
 * Represents a message button interaction.
 * @extends {Interaction}
 */
class MessageComponentInteraction extends Interaction {
  // eslint-disable-next-line no-useless-constructor
  constructor(client, data) {
    super(client, data);

    /**
     * The message to which the button was attached
     * @type {?Message|Object}
     */
    this.message = data.message ? (data.message.flags & (1 << 6) ? data.message : this.channel?.messages.add(data.message) ?? data.message) : null;

    /**
     * The custom ID of the button which was clicked
     * @type {string}
     */
    this.customID = data.data.custom_id;

    /**
     * The type of component that was interacted with
     * @type {string}
     */
    this.componentType = MessageComponentInteraction.resolveType(data.data.component_type);

    /**
     * Whether the reply to this interaction has been deferred
     * @type {boolean}
     */
    this.deferred = false;

    /**
     * Whether this interaction has already been replied to
     * @type {boolean}
     */
    this.replied = false;

    /**
     * An associated webhook client, can be used to create deferred replies
     * @type {WebhookClient}
     */
    this.webhook = new WebhookClient(this.applicationID, this.token, this.client.options);
  }

  /**
   * Resolves the type of a MessageComponent
   * @param {MessageComponentTypeResolvable} type The type to resolve
   * @returns {MessageComponentType}
   * @private
   */
  static resolveType(type) {
    return typeof type === 'string' ? type : MessageComponentTypes[type];
  }
}

InteractionResponses.applyToClass(MessageComponentInteraction);

module.exports = MessageComponentInteraction;
