'use strict';

module.exports = {
  channels: 'console',

  async run(socket, message) {
    socket.app.log.out('info', module, 'Reboot instruct received');

    await message.channel.send('Rebooting now!').catch((err) => {
      socket.app.log.out('error', module, err);
    });

    // Reboot
    process.exit(0);
  },
};
