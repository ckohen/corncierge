'use strict';

const { collect } = require('../../util/helpers');

module.exports = async (socket, guild) => {
  socket.app.log.out('info', module, "Joined new server: " + guild.name)

  // Add new guild to role and color managers
  await socket.app.database.addColorManager(String(guild.id));
  await socket.app.database.addRoleManager(String(guild.id));
  await socket.app.database.addPrefix(String(guild.id));
  await socket.app.database.addRandom(String(guild.id));
  await socket.app.database.addVolume(String(guild.id));

  // Re-cache managers
  await socket.app.database.getRoleManager().then((all) => {
    socket.roleManager.clear();
    collect(socket.roleManager, all, "guildID", false);
  });

  await socket.app.database.getColorManager().then((all) => {
    socket.colorManager.clear();
    collect(socket.colorManager, all, "guildID", false);
  });

  await socket.app.database.getPrefixes().then((all) => {
    socket.prefixes.clear();
    collect(socket.prefixes, all, "guildID", false);
  });

  await this.app.database.getRandom().then((all) => {
    this.randomSettings.clear();
    collect(this.randomSettings, all, "guildID", false);
  });

  await this.app.database.getVolume().then((volumes) => {
    volumes.forEach((volume) => {
      this.musicData.set(volume.guildID, {queue: [], isPlaying: false, nowPlaying: null, songDispatcher: null, volume: Number(volume.volume)})
    });
  });

  // Send info message in system channel

  let infoChannel = getFirstSendable();
  let msg = socket.getEmbed("welcome", []);
  if (infoChannel) {
    infoChannel.send(msg);
  }

  function getFirstSendable() {
    return guild.channels.cache.filter(chan => chan.type === "text" &&
      chan.permissionsFor(guild.client.user).has(["SEND_MESSAGES", "VIEW_CHANNEL"]))
      .sort((a, b) => a.position - b.position)
      .first();
  }
};