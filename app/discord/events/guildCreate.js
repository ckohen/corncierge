'use strict';

module.exports = async (socket, guild) => {
  socket.app.log.status(module, `Joined new server: ${guild.name}`);

  // Add new guild to database tables
  await Promise.all(socket.app.database.tables.discord.map(table => table.add(String(guild.id))));

  // Re-cache managers
  await socket.setCache();
};
