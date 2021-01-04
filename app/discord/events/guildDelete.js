'use strict';

module.exports = (socket, guild) => {
  socket.app.log(module, `Left server: ${guild.name}`);

  // Remove guild from database tables
  socket.app.database.tables.discord.forEach(table => table.delete(String(guild.id)));
  socket.app.database.tables.volumes.delete(String(guild.id));
};
