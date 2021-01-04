'use strict';

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
     * @type {Object}
     * @name TwitchManager#driver
     */

    /**
     * The Authentication manager for the application.
     * @type {AuthManager}
     */
    this.auth = new AuthManager(app, this);

    /**
     * The IRC manager for the application.
     * @type {IrcManager}
     */
    this.irc = new IrcManager(app, this);
  }

  /**
   * Fetch the channel for the application's channel ID.
   * @param {number} [userId=ApplicationOptions.twitch.channel.id] fetch channel data from a specific user id
   * @returns {Promise<Object>}
   */
  fetchChannel(userId = this.options.channel.id) {
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
    return this.fetchUser(user)
      .then(userObj => {
        const id = userObj.users[0]._id;
        /* eslint-disable-next-line newline-per-chained-call */
        return this.api.channels(id).get();
      })
      .catch(Promise.reject);
  }

  /**
   * Fetch a follow object for the given user ID.
   * @param {number} userId the user id to check the follow for
   * @param {number} [streamerId=ApplicationOptions.twitch.channel.id] the channel id to check if following
   * @returns {Promise<Object>}
   */
  follow(userId, streamerId = this.options.channel.id) {
    return this.api
      .users(userId)
      .follows.channels(streamerId)
      .get()
      .then(res => res.data);
  }

  /**
   * Fetch the stream for the application's channel ID.
   * @param {number} [userId=ApplicationOptions.twitch.channel.id] fetch stream data from a specific user id
   * @returns {void}
   */
  fetchStream(userId = this.options.channel.id) {
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
    return this.api.users.get({ params: { login: name } }).then(res => res.data);
  }

  /**
   * Fetch the uptime for the specified stream.
   * @param {string} [user = ApplicationOptions.twitch.channel.name] the user to fetch uptime for
   * @returns {Promise<number>}
   */
  fetchUptime(user = this.options.channel.name) {
    return this.fetchUser(user).then(userObj => {
      const id = userObj.users[0]._id;
      return this.fetchStream(id)
        .then(body => {
          if (body.stream == null) return Promise.reject(new Error('Stream Offline')); // eslint-disable-line eqeqeq
          return Promise.resolve(moment(body.stream.created_at).valueOf());
        })
        .catch(Promise.reject);
    });
  }
}

module.exports = TwitchManager;
