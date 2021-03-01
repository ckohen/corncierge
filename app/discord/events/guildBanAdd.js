'use strict';

const { constants, discord } = require('../../util/UtilManager');

module.exports = (socket, guild, user) => {
  let embed = socket.getEmbed('userBanChange', [user, 'Ban', constants.Colors.BRIGHT_RED]);
  if (discord.isGuild(guild.id, 'platicorn', socket.app.settings)) {
    socket.sendWebhook('userBan', embed);
  } else if (guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  }
};
