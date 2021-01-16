'use strict';

const cache = require('memory-cache');
const moment = require('moment');
const AuthManager = require('./AuthManager');
const IrcManager = require('./IrcManager');
const RequestManager = require('./RequestManager');

/**
 * Twitch manager for the application.
 * @extends {RequestManager}
 */
class TwitchManager extends RequestManager {
  constructor(app) {
    super(app, app.options.twitch);

    /**
     * The Twitch API handler.
     * @type {Axios}
     * @name TwitchManager#driver
     */

    /**
     * The Authentication manager for the application.
     * @type {AuthManager}
     */
    this.auth = new AuthManager(app, this);

    if (!app.options.disableIRC) {
      /**
       * The IRC manager for the application.
       * @type {IrcManager}
       */
      this.irc = new IrcManager(app, this);
    }
  }

  /**
   * Fetch the channel for the application's channel ID.
   * @param {number} [userId=ApplicationOptions.twitch.channel?.id] fetch channel data from a specific user id
   * @returns {Promise<Object>}
   */
  fetchChannel(userId = this.options.channel?.id) {
    this.app.log.debug(module, `Fetching channel: ${userId}`);
    return this.api
      .channels(userId)
      .get()
      .then(res => res.data);
  }

  /**
   * Fetch the channel for the specified user's channel name.
   * @param {string} user the username to fetch channel data of
   * @returns {Promise<Object>}
   */
  userChannel(user) {
    return this.getID(user).then(id => this.fetchChannel(id));
  }

  /**
   * Get the cached channel id or fetch it from the api for the user name
   * @param {string} user the username to fetch the id of
   * @returns {Promise<string>}
   */
  async getID(user) {
    this.app.log.debug(module, `Getting id for channel: ${user}`);
    let id;
    /* eslint-disable-next-line eqeqeq */
    if (cache.get(`twitch.id.${user}`) != null) {
      id = cache.get(`twitch.id.${user}`);
      this.app.log.debug(module, `ID was cached: ${id}`);
    } else {
      this.app.log.debug(module, 'ID not cached');
      const data = await this.fetchUser(user).catch(err => this.app.log.warn(err));
      if (!data) return Promise.reject(new Error('User not fetched'));
      id = data.users[0]._id;
      cache.put(`twitch.id.${user}`, id);
    }
    return Promise.resolve(id);
  }

  /**
   * Fetch a follow object for the given user ID.
   * @param {number} userId the user id to check the follow for
   * @param {number} [streamerId=ApplicationOptions.twitch.channel?.id] the channel id to check if following
   * @returns {Promise<Object>}
   */
  follow(userId, streamerId = this.options.channel?.id) {
    this.app.log.debug(module, `Fetching follow: ${userId} to ${streamerId}`);
    return this.api
      .users(userId)
      .follows.channels(streamerId)
      .get()
      .then(res => res.data);
  }

  /**
   * Fetch the stream for the application's channel ID.
   * @param {number} [userId=ApplicationOptions.twitch.channel?.id] fetch stream data from a specific user id
   * @returns {void}
   */
  fetchStream(userId = this.options.channel?.id) {
    this.app.log.debug(module, `Fetching stream: ${userId}`);
    return this.api
      .streams(userId)
      .get()
      .then(res => res.data);
  }

  /**
   * Fetch a user for the given login name.
   * @param {string} name the login name to check
   * @returns {Promise<Object>}
   */
  fetchUser(name) {
    this.app.log.debug(module, `Fetching user: ${name}`);
    return this.api.users.get({ params: { login: name } }).then(res => res.data);
  }

  /**
   * Fetch the uptime for the specified stream.
   * @param {string} [user = ApplicationOptions.twitch.channel?.name] the user to fetch uptime for
   * @returns {Promise<number>}
   */
  fetchUptime(user = this.options.channel?.name) {
    this.app.log.debug(module, `Fetching uptime: ${user}`);
    return this.getID(user)
      .then(id => this.fetchStream(id))
      .then(body => {
        if (body.stream == null) return Promise.reject(new Error('Stream Offline')); // eslint-disable-line eqeqeq
        return moment(body.stream.created_at).valueOf();
      });
  }
}

module.exports = TwitchManager;
