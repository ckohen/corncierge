'use strict';

module.exports = (socket, guild) => {
  socket.app.log.status(module, `Left server: ${guild.name}`);

  // Remove guild from database tables
  socket.app.database.tables.discord.forEach(table => table.delete(String(guild.id)));
};
