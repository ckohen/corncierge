'use strict';

module.exports = {
  /**
   * Gets the user display nme or username for a twitch user object
   * @param {Object} user the user to get from
   * @returns {string}
   */
  handle(user) {
    return user['display-name'] || user.username;
  },

  /**
   * Determines whether the defined user is a mod in the specified channel
   * @param {Object} user a twitch user object
   * @param {Object} channel a twitch channel object
   * @returns {boolean}
   */
  isPrivileged(user, channel) {
    const badges = ['admin', 'global_mod', 'moderator', 'staff'];
    const isMod = user.badges && Object.keys(user.badges).some(key => badges.includes(key));
    const isCaster = user['user-id'] === channel.id;
    return isMod || isCaster;
  },

  /**
   * Determines whether the defined user is the broadcaster of the specified channel
   * @param {Object} user a twitch user object
   * @param {Object} channel a twitch channel object
   * @returns {boolean}
   */
  isBroadcaster(user, channel) {
    const isCaster = user['user-id'] === channel.id;
    return isCaster;
  },

  /**
   * Determines whether the defined user is a vip using their badges
   * @param {Object} user a twitch user object
   * @returns {boolean}
   */
  isVip(user) {
    if (!user.badges) return false;
    return Object.prototype.hasOwnProperty.call(user.badges, 'vip');
  },
};
