'use strict';

const { clamp } = require.main.require('./app/util/helpers');

module.exports = {
  permissions: 'MANAGE_MESSAGES',
  usage: '<amount:1-100>',

  run(socket, message, [amountRaw]) {
    const amount = parseInt(amountRaw, 10);

    // No numeric amount given
    if (Number.isNaN(amount)) {
      message.channel.send(`Provide an amount to clear, ${message.author}.`).catch((err) => {
        socket.app.log.out('error', module, err);
      });
      return;
    }

    // Clear messages
    message.channel.bulkDelete(clamp(amount + 1, 2, 100), true).then((deleted) => {
      socket.app.log.out('info', module, `Deleted ${deleted.size} messages`);
    }).catch((err) => {
      socket.app.log.out('error', module, err);
    });
    socket.sendWebhook('clear', '**' + message.member.displayName + '** cleared **' + amount + `** line(s) in ${message.channel}.`);
    },
};
