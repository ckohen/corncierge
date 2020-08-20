'use strict';

module.exports = (socket, before, after) => {
  const role = after.guild.roles.find((item) => item.name === 'Voice');
  if (!role) return;

  if (after.voiceChannelID !== null) {
    if (after.user.bot && !after.deaf) {
      after.setDeaf(true);
      return;
    }
    after.addRole(role).catch((err) => {
      socket.app.log.out('error', module, err);
    });
    return;
  }

  if (after.user.bot &&
    socket.musicData.songDispatcher &&
    after.user.id == socket.driver.user.id) {
      socket.musicData.queue.length = 0;
      socket.musicData.songDispatcher.end();
    return;
  }
  
  after.removeRole(role).catch((err) => {
    socket.app.log.out('error', module, err);
  });
};
