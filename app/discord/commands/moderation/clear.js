'use strict';

const { clamp } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class ClearCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'clear',
      usage: '<amount:1-100>',
      permissions: 'MANAGE_MESSAGES',
    };
    super(socket, info);
  }

  async run(message, [amountRaw]) {
    const amount = parseInt(amountRaw, 10);

    // No numeric amount given
    if (Number.isNaN(amount)) {
      message.channel.send(`Provide an amount to clear, ${message.author}.`).catch(err => {
        this.socket.app.log.error(module, err);
      });
      return;
    }

    // Clear messages
    const success = await message.channel
      .bulkDelete(clamp(amount + 1, 2, 100), true)
      .then(deleted => {
        this.socket.app.log.debug(module, `Deleted ${deleted.size} messages`);
        return true;
      })
      .catch(err => {
        this.socket.app.log.warn(module, err);
        return false;
      });
    if (!success) return;
    /**
     * Emitted whenever a user sucessfully executes the clear command
     * @event EventLogger#discordMessageClear
     * @param {Message} message The original clear command message
     * @param {string} clearMessage The automatically generated log string for this message clear
     */
    this.socket.app.eventLogger.emit('discordMessageClear', message, `**${message.member.displayName}** cleared **${amount}** line(s) in ${message.channel}.`);
  }
}

module.exports = ClearCommand;
