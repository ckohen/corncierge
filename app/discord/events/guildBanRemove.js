'use strict';

module.exports = (socket, guild, user) => {
  let embed = socket.getEmbed('userBanChange', [user, "Pardon", 'green',]);
  if (socket.isGuild(guild.id, 'platicorn')) {
    socket.sendWebhook('userBan', embed,);
  }
  else if (guild.id === "756319910191300778") {
    socket.sendMessage('helpLogs', embed,);
  }
};