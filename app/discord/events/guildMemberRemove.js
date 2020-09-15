'use strict';

module.exports = (socket, member) => {
  socket.sendWebhook(
    'userLeft',
    socket.getEmbed('memberRemove', [
      member.user.displayAvatarURL(),
      member, member.user.tag,
      member.user.id,
    ]),
  );
};
