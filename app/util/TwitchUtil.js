'use strict';

/**
 * Stores various twitch specific utilities
 */
class TwitchUtil {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  /**
   * Gets the user display name or username for a twitch user object
   * @param {Object} user the user to get from
   * @returns {string}
   */
  static handle(user) {
    return user['display-name'] || user.username;
  }

  /**
   * Determines whether the defined user is the broadcaster of the specified channel
   * @param {Object} user a twitch user object
   * @param {Object} channel a twitch channel object
   * @returns {boolean}
   */
  static isBroadcaster(user, channel) {
    return user['user-id'] === channel.id;
  }

  /**
   * Determines whether the defined user is a mod in the specified channel
   * @param {Object} user a twitch user object
   * @param {Object} channel a twitch channel object
   * @returns {boolean}
   */
  static isPrivileged(user, channel) {
    const badges = ['admin', 'global_mod', 'moderator', 'staff'];
    const isMod = user.badges && Object.keys(user.badges).some(key => badges.includes(key));
    const isCaster = user['user-id'] === channel.id;
    return isMod ?? isCaster;
  }

  /**
   * Determines whether the defined user is a vip using their badges
   * @param {Object} user a twitch user object
   * @returns {boolean}
   */
  static isVip(user) {
    if (!user.badges) return false;
    return Object.prototype.hasOwnProperty.call(user.badges, 'vip');
  }
}

module.exports = TwitchUtil;
