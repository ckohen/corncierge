'use strict';

const { constants, discord } = require('../../util/UtilManager');

module.exports = (socket, guild, user) => {
  let embed = socket.getEmbed('userBanChange', [user, 'Pardon', constants.Colors.BRIGHT_GREEN]);
  if (discord.isGuild(guild.id, 'platicorn', socket.app.settings)) {
    socket.sendWebhook('userBan', embed);
  } else if (guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  } else if (discord.isGuild(guild.id, 'daytone', socket.app.settings)) {
    if (user.id === '178733052762128385') guild.members.ban(user, { reason: 'Requested autoban.' });
  }
};
