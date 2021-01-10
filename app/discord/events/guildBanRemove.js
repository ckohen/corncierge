'use strict';

const { Colors } = require('../../util/Constants');

module.exports = (socket, guild, user) => {
  let embed = socket.getEmbed('userBanChange', [user, 'Pardon', Colors.BRIGHT_GREEN]);
  if (socket.isGuild(guild.id, 'platicorn')) {
    socket.sendWebhook('userBan', embed);
  } else if (guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  } else if (socket.isGuild(guild.id, 'daytone')) {
    if (user.id === '178733052762128385') guild.members.ban(user, { reason: 'Requested autoban.' });
  }
};
