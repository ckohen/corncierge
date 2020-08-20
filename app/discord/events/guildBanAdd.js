'use strict';

module.exports = (socket, guild, user) => {
  socket.sendWebhook(
    'userBan',
    socket.getEmbed('userBanChange', [
      user, "Ban", 'red',
    ]),
  );
};
