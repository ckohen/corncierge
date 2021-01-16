'use strict';

const BaseCommand = require('../BaseCommand');

class RebootCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'reboot',
      channel: 'console',
    };
    super(socket, info);
  }

  async run(socket, message) {
    socket.app.log(module, 'Reboot instruct received');

    await message.channel.send('Rebooting now!').catch(err => {
      socket.app.log.warn(module, err);
    });

    // Reboot
    socket.app.end(0);
  }
}

module.exports = RebootCommand;
