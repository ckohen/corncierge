'use strict';

const { APIMessage, Snowflake, User } = require('discord.js');
const Interaction = require('./Interaction');

/**
 * Represents a command interaction, see {@link InteractionClient}.
 * @extends {Interaction}
 */
class CommandInteraction extends Interaction {
  constructor(client, data, syncHandle) {
    super(client);
    this.syncHandle = syncHandle;
    this._replied = false;
    this._patch(data);
  }

  _patch(data) {
    this.type = data.type;

    /**
     * The ID of this interaction.
     * @type {Snowflake}
     * @readonly
     */
    this.id = data.id;

    /**
     * The token of this interaction.
     * @type {string}
     * @readonly
     */
    this.token = data.token;

    /**
     * The ID of the invoked command.
     * @type {Snowflake}
     * @readonly
     */
    this.commandID = data.data.id;

    /**
     * The name of the invoked command.
     * @type {string}
     * @readonly
     */
    this.commandName = data.data.name;

    /**
     * The options passed to the command.
     * @type {Object}
     * @readonly
     */
    this.options = data.data.options;

    /**
     * The channel this interaction was sent in.
     * @type {?Channel}
     * @readonly
     */
    this.channel = this.client.channels?.cache.get(data.channel_id) || null;

    /**
     * If this interaction was sent in a DM, the user which sent it.
     * @type {?User}
     * @readonly
     */
    this.user = data.user ? this.client.users?.add(data.user, false) ?? new User(this.client, data.user) : null;

    /**
     * The guild this interaction was sent in, if any.
     * @type {?Guild}
     * @readonly
     */
    this.guild = this.client.guilds?.cache.get(data.guild_id) ?? null;

    /**
     * If this interaction was sent in a guild, the member which sent it.
     * @type {?GuildMember}
     * @readonly
     */
    this.member = this.guild?.members.add(data.member, false) ?? null;
  }

  /**
   * The timestamp the interaction was created at.
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return Snowflake.deconstruct(this.id).timestamp;
  }

  /**
   * The time the interaction was created at.
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * Acknowledge this interaction without content.
   * @param {Object} [options] Options
   */
  async acknowledge(options = {}) {
    await this.syncHandle.acknowledge(options);
  }

  /**
   * Reply to this interaction.
   * @param {(StringResolvable | APIMessage)?} content The content for the message.
   * @param {(MessageOptions | MessageAdditions)?} options The options to provide.
   */
  async reply(content, options) {
    let apiMessage;

    if (content instanceof APIMessage) {
      apiMessage = content.resolveData();
    } else {
      apiMessage = APIMessage.create(this, content, options).resolveData();
      if (Array.isArray(apiMessage.data.content)) {
        throw new Error('Message is too long');
      }
    }

    Object.defineProperty(apiMessage.data, 'flags', {
      value: options?.ephemeral ? 64 : 0,
      writable: true,
    });

    if (apiMessage.data.embed) {
      Object.defineProperty(apiMessage.data, 'embeds', {
        value: [apiMessage.data.embed],
        writable: true,
      });
    }

    const resolved = await apiMessage.resolveFiles();

    if (!this.syncHandle.reply(resolved)) {
      const clientID = this.client.user?.id || (await this.client.api.oauth2.applications('@me').get()).id;

      if (this._replied) {
        await this.client.api.webhooks(clientID, this.token).post({
          auth: false,
          data: resolved.data,
          files: resolved.files,
        });
      } else {
        resolved.data.flags = undefined;
        await this.client.api.webhooks(clientID, this.token).messages('@original').patch({
          auth: false,
          data: resolved.data,
          files: resolved.files,
        });
        this._replied = true;
      }
    } else {
      this._replied = true;
    }
  }
}

module.exports = CommandInteraction;
