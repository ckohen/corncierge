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

  run(socket, message, [amountRaw]) {
    const amount = parseInt(amountRaw, 10);

    // No numeric amount given
    if (Number.isNaN(amount)) {
      message.channel.send(`Provide an amount to clear, ${message.author}.`).catch(err => {
        socket.app.log.error(module, err);
      });
      return;
    }

    // Clear messages
    message.channel
      .bulkDelete(clamp(amount + 1, 2, 100), true)
      .then(deleted => {
        socket.app.log.debug(module, `Deleted ${deleted.size} messages`);
      })
      .catch(err => {
        socket.app.log.warn(module, err);
      });
    if (discord.isGuild(message.guild.id, 'platicorn', socket.app.settings)) {
      socket.sendWebhook('clear', `**${message.member.displayName}** cleared **${amount}** line(s) in ${message.channel}.`);
    } else if (message.guild.id === '756319910191300778') {
      socket.sendMessage('helpLogs', `**${message.member.displayName}** cleared **${amount}** line(s) in ${message.channel}.`);
    }
  }
}

module.exports = ClearCommand;
