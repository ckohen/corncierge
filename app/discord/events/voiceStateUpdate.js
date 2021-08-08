'use strict';

module.exports = (socket, before, after) => {
  if (after.channelId === before.channelId) return;

  let afterRole = after.guild.roles.cache.find(item => item.name.toLowerCase() === 'voice');
  let beforeRole = afterRole;
  let roleData = socket.cache.voiceRoles.get(String(after.member.guild.id));

  if (Object.keys(roleData.data).length > 0) {
    afterRole = null;
    let afterId = null;
    let beforeId = null;
    let roles = Object.keys(roleData.data);
    roles.forEach(roleId => {
      if (roleData.data[roleId].indexOf(after.channelId) > -1) {
        afterId = roleId;
      }
      if (roleData.data[roleId].indexOf(before.channelId) > -1) {
        beforeId = roleId;
      }
    });
    if (afterId !== beforeId) {
      if (afterId) {
        afterRole = after.guild.roles.cache.get(afterId);
      }
      if (beforeId) {
        beforeRole = after.guild.roles.cache.get(beforeId);
      }
    }
  }

  if (after.channelId !== null) {
    if (after.member.user.id === socket.driver.user.id && !after.selfDeaf) {
      after.setSelfDeaf(true);
      return;
    }
    if (after.member.user.bot && !after.deaf) {
      after.setDeaf(true);
      return;
    }
    if (afterRole) {
      after.member.roles.add(afterRole).catch(err => {
        socket.app.log.warn(module, err);
      });
    }
    if (beforeRole && beforeRole !== afterRole) {
      after.member.roles.remove(beforeRole).catch(err => {
        socket.app.log.warn(module, err);
      });
    }
    return;
  }

  if (!beforeRole) return;
  if (!after.member) return;
  after.member.roles.remove(beforeRole).catch(err => {
    socket.app.log.warn(module, err);
  });
};
