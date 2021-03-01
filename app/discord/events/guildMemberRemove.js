'use strict';

const { isGuild } = require('../../util/UtilManager').discord;

module.exports = (socket, member) => {
  let embed = socket.getEmbed('memberRemove', [member.user.displayAvatarURL(), member, member.user.tag, member.user.id]);
  if (isGuild(member.guild.id, 'platicorn', socket.app.settings)) {
    socket.sendWebhook('userLeft', embed);
  } else if (member.guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  }
};
