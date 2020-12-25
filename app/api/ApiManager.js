'use strict';

const cache = require('memory-cache');
const moment = require('moment');
const rp = require('request-promise');

const Request = require('../Request');

/**
 * API manager for the application.
 * @extends {Request}
 * @private
 */
class ApiManager extends Request {
  /**
   * Create a new API manager instance.
   * @param {Application} app the application that insantiated this
   */
  constructor(app) {
    super();

    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The application options.
     * @type {Object}
     */
    this.opts = this.app.options;

    /**
     * The API driver.
     * @type {Function}
     */
    this.driver = rp.defaults({
      baseUrl: this.opts.api.baseUrl,
      headers: {
        Accept: this.opts.api.mime,
        'Client-ID': this.opts.api.client,
      },
    });
  }

  /**
   * Get the channel for the application's channel ID.
   * @param {Function} callback the function to call afer getting channel data
   * @param {number} [userId=false] get channel data from a specific user id
   * @returns {void}
   */
  channel(callback, userId = false) {
    if (userId) {
      return this.get(`channels/${userId}`, {}, callback);
    }
    return this.get(`channels/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get the channel for the specified user's channel name.
   * @param {string} user the username to get channel data of
   * @param {Function} callback the function to call afer getting channel data
   * @returns {void}
   */
  userChannel(user, callback) {
    try {
      return this.get(`users?login=${user}`, {}, userObj => {
        const id = userObj.users[0]._id;
        return this.get(`channels/${id}`, {}, callback);
      });
    } catch (error) {
      return callback(false);
    }
  }

  /**
   * Get a follow object for the given user ID.
   * @param {number} userId the user id to check the follow for
   * @param {number} [streamerId=false] the channel to check if following
   * @returns {Promise<Request>}
   */
  follow(userId, streamerId = false) {
    if (streamerId) {
      return this.promise(`users/${userId}/follows/channels/${streamerId}`);
    }
    return this.promise(`users/${userId}/follows/channels/${this.opts.twitch.channel.id}`);
  }

  /**
   * Get the stream for the application's channel ID.
   * @param {Function} callback the function to call afer getting stream data
   * @param {number} [userId=false] get stream data from a specific user id
   * @returns {void}
   */
  stream(callback, userId = false) {
    if (userId) {
      return this.get(`streams/${userId}`, {}, callback);
    }
    return this.get(`streams/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get a user for the given login name.
   * @param {string} name the login name to check
   * @param {Function} callback the function to call afer getting user data
   * @returns {void}
   */
  user(name, callback) {
    this.get(`users?login=${name}`, {}, callback);
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
      this.get(`users?login=${user}`, {}, userObj => {
        const id = userObj.users[0]._id;
        this.stream(body => {
          this.uptimeCallback(body, callback, user, id, readOnly);
        }, id);
      });
    } catch (error) {
      this.app.log.out('debug', module, `Failed to get ${user} uptime`);
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
      this.app.log.out('debug', module, `Uptime for ${user} cached`);
    }

    return callback(time);
  }
}

module.exports = ApiManager;
