'use strict';

const cache = require('memory-cache');
const moment = require('moment');
const RequestManager = require('../managers/RequestManager');

/**
 * API manager for the application.
 * @extends {RequestManager}
 */
class ApiManager extends RequestManager {
  constructor(app) {
    super(app, app.options.api);

    /**
     * The Twitch API handler.
     * @type {Object}
     * @name ApiManager#driver
     */
  }

  /**
   * Get the channel for the application's channel ID.
   * @param {Function} callback the function to call afer getting channel data
   * @param {number} [userId=this.app.options.twitch.channel.id] get channel data from a specific user id
   * @returns {void}
   */
  channel(callback, userId = this.app.options.twitch.channel.id) {
    return this.api
      .channels(userId)
      .get()
      .then(callback)
      .catch(err => this.app.log.warn(module, err));
  }

  /**
   * Get the channel for the specified user's channel name.
   * @param {string} user the username to get channel data of
   * @param {Function} callback the function to call afer getting channel data
   * @returns {void}
   */
  userChannel(user, callback) {
    return this.api.users
      .get({ params: { login: user } })
      .then(userObj => {
        const id = userObj.users[0]._id;
        /* eslint-disable-next-line newline-per-chained-call */
        return this.api.channels(id).get().then(callback).catch(callback(false));
      })
      .catch(callback(false));
  }

  /**
   * Get a follow object for the given user ID.
   * @param {number} userId the user id to check the follow for
   * @param {number} [streamerId=this.app.options.twitch.channel.id] the channel to check if following
   * @returns {Promise<Object>}
   */
  follow(userId, streamerId = this.app.options.twitch.channel.id) {
    return this.api.users(userId).follows.channels(streamerId).get();
  }

  /**
   * Get the stream for the application's channel ID.
   * @param {Function} callback the function to call afer getting stream data
   * @param {number} [userId=this.app.options.twitch.channel.id] get stream data from a specific user id
   * @returns {void}
   */
  stream(callback, userId = this.app.options.twitch.channel.id) {
    return this.api
      .streams(userId)
      .get()
      .then(callback)
      .catch(err => this.app.log.warn(module, err));
  }

  /**
   * Get a user for the given login name.
   * @param {string} name the login name to check
   * @param {Function} callback the function to call afer getting user data
   * @returns {void}
   */
  user(name, callback) {
    return this.api.users
      .get({ params: { login: name } })
      .then(callback)
      .catch(err => this.app.log.warn(module, err));
  }

  /**
   * Get the uptime for the specified stream.
   * @param {Function} callback the function to call afer getting channel data
   * @param {string} user the user to check uptime for
   * @param {boolean} [readOnly=false] whether to override the caching behavior
   * @returns {void}
   */
  uptime(callback, user, readOnly = false) {
    const cached = cache.get(`stream.uptime.${user}`);
    const cachedId = cache.get(`stream.user.${user}`);

    if (cached !== null) {
      callback(cached);
      return;
    }

    if (cachedId !== null) {
      this.stream(body => {
        this.uptimeCallback(body, callback, user, cachedId, readOnly);
      }, cachedId);
    }

    try {
      this.api.users.get({ params: { login: user } }).then(userObj => {
        const id = userObj.users[0]._id;
        this.stream(body => {
          this.uptimeCallback(body, callback, user, id, readOnly);
        }, id);
      });
    } catch (error) {
      this.app.log.debug(module, `Failed to get ${user} uptime`);
    }
  }

  uptimeCallback(body, callback, user, id, readOnly) {
    // Channel not live
    if (body.stream === null) return callback();

    // Stream start timestamp in milliseconds
    const time = moment(body.stream.created_at).valueOf();

    if (!readOnly) {
      const thirtyMins = 1800000;
      const fiveMins = 300000;
      cache.put(`stream.uptime.${user}`, time, fiveMins);
      cache.put(`stream.user.${user}`, id, thirtyMins);
      this.app.log.debug(module, `Uptime for ${user} cached`);
    }

    return callback(time);
  }
}

module.exports = ApiManager;
