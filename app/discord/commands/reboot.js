'use strict';

module.exports = {
  channel: 'console',

  run(socket, message) {
    socket.app.log.out('info', module, 'Reboot instruct received');

    message.channel.send('Rebooting now!').catch((err) => {
      socket.app.log.out('error', module, err);
    });

    // Reboot
    process.exit(0);
  },
};
