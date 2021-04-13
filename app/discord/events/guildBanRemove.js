'use strict';

const { constants } = require('../../util/UtilManager');

module.exports = (socket, guild, user) => {
  let embed = socket.getEmbed('userBanChange', [user, 'Pardon', constants.Colors.BRIGHT_GREEN]);
  /**
   * Emitted whenever a member is unbanned from a guild.
   * @event EventLogger#discordBanRemove
   * @param {Guild} guild The guild the unban occured in
   * @param {User} user The user that was unbanned
   * @param {MessageEmbed} embed The automatically generated embed for this unban
   */
  socket.app.eventLogger.emit('discordBanRemove', guild, user, embed);
};
