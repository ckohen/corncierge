'use strict';

module.exports = async (socket, guild) => {
  socket.app.log.out('info', module, `Joined new server: ${guild.name}`);

  // Add new guild to role and color managers
  await socket.app.database.add('colorManager', [String(guild.id)]);
  await socket.app.database.add('roleManager', [String(guild.id)]);
  await socket.app.database.add('reactionRoles', [String(guild.id)]);
  await socket.app.database.add('voiceRoles', [String(guild.id)]);
  await socket.app.database.add('prefixes', [String(guild.id)]);
  await socket.app.database.add('randomChannels', [String(guild.id)]);
  await socket.app.database.add('newMemberRole', [String(guild.id)]);
  await socket.app.database.add('volumes', [String(guild.id)]);

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
