'use strict';

/**
 * Stores various discord specific utilities
 */
class DiscordUtil {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }
  /**
   * Confirm a users desire to perform an action
   * @param {Message|Interaction} message the message you are confirming in response to
   * @param {string} text the text to say in the confirmation
   * @param {number} time how long to wait for a reaction
   * @returns {Promise<boolean>}
   */
  static async confirmAction(message, text, time) {
    const confirmMsg = await message.channel.send(text);
    await confirmMsg.react('✅');
    await confirmMsg.react('❌');
    let reacted = true;
    let collected = await confirmMsg
      .awaitReactions((reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id, {
        max: 1,
        time: time,
        errors: ['time'],
      })
      .catch(() => (reacted = false));
    if (!reacted) {
      const errorMsg = await message.channel.send(`${message.member}, No reaction received, cancelling!`);
      confirmMsg.delete().then(() => (reacted = false));
      errorMsg.delayDelete(6000);
      return Promise.reject(new Error('No Response'));
    }

    // Determine the desired action
    const reaction = collected.first();
    if (reaction.emoji.name === '❌') {
      const cancelledMsg = await message.channel.send(`${message.member}, Cancelled!`);
      cancelledMsg.delayDelete(5000);
      confirmMsg.delete();
      return false;
    } else {
      confirmMsg.delete();
      return true;
    }
  }

  static extendMessage(base) {
    class CustomMessage extends base {
      _patch(data) {
        super._patch(data);
        this.components = data.components ?? [];
      }

      patch(data) {
        const clone = super.patch(data);
        if ('components' in data) this.components = data.components;
        else this.components = this.components.slice();
        return clone;
      }
      /**
       * Deletes this message (if possible) after a specified time
       * @name Message#delayDelete
       * @param {number} time how long to delay
       */
      delayDelete(time) {
        setTimeout(() => {
          if (this.deletable) this.delete();
        }, time);
      }
    }
    return CustomMessage;
  }

  /**
   * Checks whether a string is a valid discord snowflake
   * @param {string} potentialSnoflake the string to check for a snwoflake
   * @returns {boolean}
   */
  static isSnowflake(potentialSnoflake) {
    return !!String(potentialSnoflake).match(/[0-9]{17,18}/g);
  }

  /**
   * Test a guild ID against the setting for the given key
   * @param {string} id the id of the guild to test
   * @param {string|Snowflake|Snowflake[]} slugOrId the guild name or id(s)
   * @param {Collection} settings the app settings for checking slugs
   * @returns {boolean}
   */
  static isGuild(id, slugOrId, settings) {
    if (Array.isArray(slugOrId)) {
      return slugOrId.some(elem => DiscordUtil.isGuild(id, elem, settings));
    } else if (DiscordUtil.isSnowflake(slugOrId)) {
      return slugOrId === id;
    }
    return settings.get(`discord_guild_${slugOrId}`).split(',').includes(id);
  }

  /**
   * Test a channel ID against the setting for the given key
   * @param {string} id the id of the channel to test
   * @param {string|Snowflake|Snowflake[]} slugOrId the channel name or id(s)
   * @param {Collection} settings the app settings for checking slugs
   * @returns {boolean}
   */
  static isChannel(id, slugOrId, settings) {
    if (Array.isArray(slugOrId)) {
      return slugOrId.some(elem => DiscordUtil.isChannel(id, elem, settings));
    } else if (DiscordUtil.isSnowflake(slugOrId)) {
      return slugOrId === id;
    }
    return settings.get(`discord_channel_${slugOrId}`).split(',').includes(id);
  }

  /**
   * Test a user ID against the setting for the given key
   * @param {string} id the id of the user to test
   * @param {string|Snowflake|Snowflake[]} slugOrId the user name or id(s)
   * @param {Collection} settings the app settings for checking slugs
   * @returns {boolean}
   */
  static isUser(id, slugOrId, settings) {
    if (Array.isArray(slugOrId)) {
      return slugOrId.some(elem => DiscordUtil.isUser(id, elem, settings));
    } else if (DiscordUtil.isSnowflake(slugOrId)) {
      return slugOrId === id;
    }
    return settings.get(`discord_user_${slugOrId}`).split(',').includes(id);
  }
}

module.exports = DiscordUtil;
