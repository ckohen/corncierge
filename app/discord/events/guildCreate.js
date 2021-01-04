'use strict';

module.exports = async (socket, guild) => {
  socket.app.log(module, `Joined new server: ${guild.name}`);

  // Add new guild to database tables
  await Promise.all(socket.app.database.tables.discord.map(table => table.add(String(guild.id))));
  await socket.app.database.tables.volumes.add(String(guild.id));

  // Re-cache managers
  await socket.setCache();

  // Send info message in system channel

  let infoChannel = getFirstSendable();
  let msg = socket.getEmbed('welcome', []);
  if (infoChannel) {
    infoChannel.send(msg);
  }

  function getFirstSendable() {
    return guild.channels.cache
      .filter(chan => chan.type === 'text' && chan.permissionsFor(guild.client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL']))
      .sort((a, b) => a.position - b.position)
      .first();
  }
};
