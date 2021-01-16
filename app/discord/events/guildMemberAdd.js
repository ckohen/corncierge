'use strict';

const util = require('../../util/UtilManager');

module.exports = (socket, member) => {
  const created = util.humanDate(member.user.createdAt);
  let embed = socket.getEmbed('memberAdd', [member.user.displayAvatarURL(), member, member.user.tag, created, member.user.id]);

  if (socket.isGuild(member.guild.id, 'platicorn')) {
    socket.sendWebhook('userJoin', embed);
  } else if (member.guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  }

  let roleData = socket.newMemberRole.get(String(member.guild.id));

  if (roleData.roleID) {
    let time = Number(roleData.delayTime) ? Number(roleData.delayTime) : 0;
    setTimeout(() => {
      member.roles.add(roleData.roleID);
    }, time);
  }
};
