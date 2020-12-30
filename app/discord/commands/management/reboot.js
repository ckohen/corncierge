'use strict';

module.exports = {
  channel: 'console',

  async run(socket, message) {
    socket.app.log(module, 'Reboot instruct received');

    await message.channel.send('Rebooting now!').catch(err => {
      socket.app.log.error(module, err);
    });

    // Reboot
    socket.app.end(0);
  },
};
