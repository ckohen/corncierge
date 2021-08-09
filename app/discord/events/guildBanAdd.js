'use strict';

const { constants } = require('../../util/UtilManager');

module.exports = (socket, ban) => {
  let embed = socket.getEmbed('userBanChange', [ban.user, 'Ban', constants.Colors.BRIGHT_RED]);
  /**
   * Emitted whenever a member is banned from a guild.
   * @event EventLogger#discordBanAdd
   * @param {Guild} guild The guild the ban occured in
   * @param {User} user The user that was banned
   * @param {MessageEmbed} embed The automatically generated embed for this ban
   */
  socket.app.eventLogger.emit('discordBanAdd', ban.guild, ban.user, embed);
};
