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

  async run(message) {
    this.socket.app.log(module, 'Reboot instruct received');

    await message.channel.send('Rebooting now!').catch(err => {
      this.socket.app.log.warn(module, err);
    });

    // Reboot
    this.socket.app.end(0);
  }
}

module.exports = RebootCommand;
