'use strict';

module.exports = (socket, before, after) => {
  const role = after.guild.roles.cache.find((item) => item.name === 'Voice');

  if (after.channelID !== null) {
    if (after.member.user.id == socket.driver.user.id && !after.selfDeaf) {
      after.setSelfDeaf(true);
      return;
    }
    if (after.member.user.bot && !after.deaf) {
      after.setDeaf(true);
      return;
    }
    if (!role) return;
    after.member.roles.add(role).catch((err) => {
      socket.app.log.out('error', module, err);
    });
    return;
  }

  if (after.member.user.bot &&
    socket.musicData.songDispatcher &&
    after.member.user.id == socket.driver.user.id) {
      socket.musicData.queue.length = 0;
      socket.musicData.songDispatcher.end();
    return;
  }
  
  if (!role) return;
  after.roles.remove(role).catch((err) => {
    socket.app.log.out('error', module, err);
  });
};
