'use strict';

const helpers = require.main.require('./app/util/helpers');

module.exports = (socket, member) => {
  const created = helpers.humanDate(member.user.createdAt);

  socket.sendWebhook(
    'userJoin',
    socket.getEmbed('memberAdd', [
      member.user.displayAvatarURL(),
      member, member.user.tag, created,
      member.user.id,
    ]),
  );
};
