'use strict';

const { WebhookClient } = require('discord.js');
const Interaction = require('./Interaction');
const InteractionResponses = require('./InteractionResponses');
const { ApplicationCommandOptionTypes } = require('../util/Constants');

/**
 * Represents a command interaction, see {@link InteractionClient}.
 * @extends {Interaction}
 */
class CommandInteraction extends Interaction {
  constructor(client, data) {
    super(client, data);
    /**
     * The ID of the invoked application command
     * @type {Snowflake}
     */
    this.commandID = data.data.id;

    /**
     * The name of the invoked application command
     * @type {string}
     */
    this.commandName = data.data.name;

    /**
     * Whether the reply to this interaction has been deferred
     * @type {boolean}
     */
    this.deferred = false;

    /**
     * The options passed to the command.
     * @type {CommandInteractionOption[]}
     */
    this.options = data.data.options?.map(o => this.transformOption(o, data.data.resolved)) ?? [];

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
   * Transforms an option received from the API.
   * @param {Object} option The received option
   * @param {Object} resolved The resolved interaction data
   * @returns {CommandInteractionOption}
   * @private
   */
  transformOption(option, resolved) {
    const result = {
      name: option.name,
      type: ApplicationCommandOptionTypes[option.type],
    };

    if ('value' in option) result.value = option.value;
    if ('options' in option) result.options = option.options.map(o => this.transformOption(o, resolved));

    const user = resolved?.users?.[option.value];
    if (user) result.user = this.client.users.add(user);

    const member = resolved?.members?.[option.value];
    if (member) result.member = this.guild?.members.add({ user, ...member }) ?? member;

    const channel = resolved?.channels?.[option.value];
    if (channel) result.channel = this.client.channels.add(channel, this.guild) ?? channel;

    const role = resolved?.roles?.[option.value];
    if (role) result.role = role;

    return result;
  }
}

InteractionResponses.applyToClass(CommandInteraction, ['deferUpdate', 'update']);

module.exports = CommandInteraction;
