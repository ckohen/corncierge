'use strict';

module.exports = {
  handle(user) {
    return user['display-name'] || user.username;
  },

  isPrivileged(user, channel) {
    const badges = ['admin', 'global_mod', 'moderator', 'staff'];
    const isMod = user.badges && Object.keys(user.badges)
      .some((key) => badges.includes(key));
    const isCaster = user['user-id'] === channel.id; // config.twitch.channel.id
    return isMod || isCaster;
  },

  isBroadcaster(user, channel) {
    const isCaster = user['user-id'] === channel.id; // config.twitch.channel.id
    return isCaster;
  },

  isVip(user) {
    if (!user.badges) return false;
    return Object.prototype.hasOwnProperty.call(user.badges, 'vip');
  },
};
