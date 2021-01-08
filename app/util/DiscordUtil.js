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
      module.exports.delayDelete(errorMsg, 6000);
      return Promise.reject(new Error('No Response'));
    }

    // Determine the desired action
    const reaction = collected.first();
    if (reaction.emoji.name === '❌') {
      const cancelledMsg = await message.channel.send(`${message.member}, Cancelled!`);
      module.exports.delayDelete(cancelledMsg, 5000);
      confirmMsg.delete();
      return false;
    } else {
      confirmMsg.delete();
      return true;
    }
  }

  /**
   * Deletes a message (if possible) after a specified time
   * @param {Message} message the message to delete
   * @param {number} time how long to delay
   */
  static delayDelete(message, time) {
    setTimeout(() => {
      if (message.deletable) message.delete();
    }, time);
  }
}

module.exports = DiscordUtil;
