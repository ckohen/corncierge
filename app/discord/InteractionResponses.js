'use strict';

const { APIMessage, WebhookClient } = require('discord.js');
const { InteractionResponseTypes } = require('../util/Constants');

/**
 * Interface for classes that support shared interaction response types.
 * @interface
 */
class InteractionResponses {
  constructor() {
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
   * Options for deferring the reply to a {@link CommandInteraction}.
   * @typedef {InteractionDeferOptions}
   * @property {boolean} [ephemeral] Whether the reply should be ephemeral
   */

  /**
   * Options for a reply to an interaction.
   * @typedef {BaseMessageOptions} InteractionReplyOptions
   * @property {boolean} [ephemeral] Whether the reply should be ephemeral
   * @property {MessageEmbed[]|Object[]} [embeds] An array of embeds for the message
   */

  /**
   * Defers the reply to this interaction.
   * @param {InteractionDeferOptions} [options] Options for deferring the reply to this interaction
   * @returns {Promise<void>}
   * @example
   * // Defer the reply to this interaction
   * interaction.defer()
   *   .then(console.log)
   *   .catch(console.error)
   * @example
   * // Defer to send an ephemeral reply later
   * interaction.defer({ ephemeral: true })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async defer({ ephemeral } = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    this.deferred = true;
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: ephemeral ? 64 : undefined,
        },
      },
    });
  }

  /**
   * Creates a reply to this interaction.
   * @param {string|APIMessage|MessageAdditions} content The content for the reply
   * @param {InteractionReplyOptions} [options] Additional options for the reply
   * @returns {Promise<void>}
   * @example
   * // Reply to the interaction with an embed
   * const embed = new MessageEmbed().setDescription('Pong!');
   *
   * interaction.reply(embed)
   *   .then(console.log)
   *   .catch(console.error);
   * @example
   * // Create an ephemeral reply
   * interaction.reply('Pong!', { ephemeral: true })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async reply(content, options) {
    const apiMessage = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this, content, options).resolveData();

    Object.defineProperty(apiMessage.data, 'flags', {
      value: apiMessage.options?.ephemeral ? 64 : 0,
      writable: true,
    });

    if (apiMessage.data.embed) {
      Object.defineProperty(apiMessage.data, 'embeds', {
        value: [apiMessage.data.embed],
        writable: true,
      });
    }

    const { data, files } = await apiMessage.resolveFiles();

    if (!this.deferred && !this.replied) {
      this.replied = true;
      await this.client.api.interactions(this.id, this.token).callback.post({
        data: {
          type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
          data,
        },
        files,
      });
    } else if (this.deferred) {
      data.flags = undefined;
      this.replied = true;
      await this.client.api.webhooks(this.client.user.id, this.token).messages('@original').patch({
        auth: false,
        data,
        files,
      });
    } else {
      await this.followUp(apiMessage);
    }
  }

  /**
   * Fetches the initial reply to this interaction.
   * @see Webhook#fetchMessage
   * @returns {Promise<Message|Object>}
   * @example
   * // Fetch the reply to this interaction
   * interaction.fetchReply()
   *   .then(reply => console.log(`Replied with ${reply.content}`))
   *   .catch(console.error);
   */
  async fetchReply() {
    const raw = await this.webhook.fetchMessage('@original');
    return this.channel?.messages.add(raw) ?? raw;
  }

  /**
   * Edits the initial reply to this interaction.
   * @see Webhook#editMessage
   * @param {string|APIMessage|MessageAdditions} content The new content for the message
   * @param {WebhookEditMessageOptions} [options] The options to provide
   * @returns {Promise<Message|Object>}
   * @example
   * // Edit the reply to this interaction
   * interaction.editReply('New content')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async editReply(content, options) {
    const raw = await this.webhook.editMessage('@original', content, options);
    return this.channel?.messages.add(raw) ?? raw;
  }

  /**
   * Deletes the initial reply to this interaction.
   * @see Webhook#deleteMessage
   * @returns {Promise<void>}
   * @example
   * // Delete the reply to this interaction
   * interaction.deleteReply()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deleteReply() {
    await this.webhook.deleteMessage('@original');
  }

  /**
   * Send a follow-up message to this interaction.
   * @param {string|APIMessage|MessageAdditions} content The content for the reply
   * @param {InteractionReplyOptions} [options] Additional options for the reply
   * @returns {Promise<Message|Object>}
   */
  async followUp(content, options) {
    const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
    const { data, files } = await apiMessage.resolveData().resolveFiles();

    const raw = await this.client.api.webhooks(this.applicationID, this.token).post({
      data,
      files,
    });

    return this.channel?.messages.add(raw) ?? raw;
  }

  /**
   * Defers an update to the message to which the button was attached
   * @returns {Promise<void>}
   * @example
   * // Defer to update the button to a loading state
   * interaction.defer()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deferUpdate() {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_MESSAGE_UPDATE,
      },
    });
    this.deferred = true;
  }

  /**
   * Updates the message to which the button was attached
   * @param {string|APIMessage|MessageAdditions} content The content for the reply
   * @param {WebhookEditMessageOptions} [options] Additional options for the reply
   * @returns {Promise<Message|Object>}
   * @example
   * // Remove the buttons from the message   *
   * interaction.reply("A button was clicked", { components: [] })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async update(content, options) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
    const { data, files } = await apiMessage.resolveData().resolveFiles();

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.UPDATE_MESSAGE,
        data,
      },
      files,
    });
    this.replied = true;
  }

  static applyToClass(structure, ignore = []) {
    const props = ['defer', 'reply', 'fetchReply', 'editReply', 'deleteReply', 'followUp', 'deferUpdate', 'update'];
    for (const prop of props) {
      if (ignore.includes(prop)) continue;
      Object.defineProperty(structure.prototype, prop, Object.getOwnPropertyDescriptor(InteractionResponses.prototype, prop));
    }
  }
}

module.exports = InteractionResponses;
