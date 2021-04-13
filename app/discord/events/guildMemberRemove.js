'use strict';

module.exports = (socket, member) => {
  let embed = socket.getEmbed('memberRemove', [member.user.displayAvatarURL(), member, member.user.tag, member.user.id]);
  /**
   * Emitted whenever a member leaves a guild, or is kicked.
   * @event EventLogger#discordMemberRemove
   * @param {GuildMember} member The member that has left/been kicked from the guild
   * @param {MessageEmbed} embed The automatically generated embed for this member remove
   */
  socket.app.eventLogger.emit('discordMemberRemove', member, embed);
};
