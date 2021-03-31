'use strict';

const { clamp, discord } = require('../../../util/UtilManager');
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

  run(message, [amountRaw]) {
    const amount = parseInt(amountRaw, 10);

    // No numeric amount given
    if (Number.isNaN(amount)) {
      message.channel.send(`Provide an amount to clear, ${message.author}.`).catch(err => {
        this.socket.app.log.error(module, err);
      });
      return;
    }

    // Clear messages
    message.channel
      .bulkDelete(clamp(amount + 1, 2, 100), true)
      .then(deleted => {
        this.socket.app.log.debug(module, `Deleted ${deleted.size} messages`);
      })
      .catch(err => {
        this.socket.app.log.warn(module, err);
      });
    if (discord.isGuild(message.guild.id, 'platicorn', this.socket.app.settings)) {
      this.socket.sendWebhook('clear', `**${message.member.displayName}** cleared **${amount}** line(s) in ${message.channel}.`);
    } else if (message.guild.id === '756319910191300778') {
      this.socket.sendMessage('helpLogs', `**${message.member.displayName}** cleared **${amount}** line(s) in ${message.channel}.`);
    }
  }
}

module.exports = ClearCommand;
