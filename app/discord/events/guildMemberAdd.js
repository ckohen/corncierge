'use strict';

const util = require('../../util/UtilManager');

module.exports = (socket, member) => {
  const created = util.humanDate(member.user.createdAt);
  let embed = socket.getEmbed('memberAdd', [member.user.displayAvatarURL(), member, member.user.tag, created, member.user.id]);

  /**
   * Emitted whenever a user joins a guild.
   * @event EventLogger#discordMemberAdd
   * @param {GuildMember} member The member that has joined a guild
   * @param {MessageEmbed} embed The automatically generated embed for this member add
   */
  socket.app.eventLogger.emit('discordMemberAdd', member, embed);

  let roleData = socket.cache.newMemberRole.get(String(member.guild.id));

  if (roleData.roleId) {
    let time = Number(roleData.delayTime) ? Number(roleData.delayTime) : 0;
    setTimeout(() => {
      member.roles.add(roleData.roleId);
    }, time);
  }
};
