'use strict';

const { Collection } = require('discord.js');
const cache = require('memory-cache');
const moment = require('moment');
const APIManager = require('./APIManager');
const AuthManager = require('./AuthManager');
const IrcManager = require('./IrcManager');

/**
 * Twitch manager for the application.
 * @extends {APIManager}
 */
class TwitchManager extends APIManager {
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

    /**
     * The data for a ratelimit on any route
     * @typedef {Object} RatelimitData
     * @prop {number} limit The average number of requests per minute that can be made
     * @prop {number} remaining The number of points left in this minute
     * @prop {number} reset The timestamp at which the points are reset to full
     */

    /**
     * Data for queueing and ratelimiting requests for the keyed token
     * @typedef {Object} RatelimitedRequestData
     * @prop {Array<{promise: Promise, resolve: Function}>} promises The promise queue for this key
     * @prop {RatelimitData} ratelimit The ratelimit data for this key
     */

    /**
     * The queued requests and their ratelimits
     * @type {Collection<string, RatelimitedRequestData>}
     * @private
     */
    this._requests = new Collection();

    this.driver.interceptors.request.use(this._preRequest.bind(this));
    this.driver.interceptors.response.use(this._postRequest.bind(this), this._postErrorRequest.bind(this));
  }

  /**
   * Fetch the channel for the application's channel ID.
   * @param {number} [userId=ApplicationOptions.twitch.channel?.id] fetch channel data from a specific user id
   * @returns {Promise<Object>}
   */
  fetchChannel(userId = this.options.channel?.id) {
    this.app.log.debug(module, `Fetching channel: ${userId}`);
    return this.api
      .channels()
      .get({ params: { broadcaster_id: userId }, authID: userId, allowApp: true })
      .then(res => res.data?.[0]);
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
    this.app.log.verbose(module, `Getting id for channel: ${user}`);
    let id;
    /* eslint-disable-next-line eqeqeq */
    if (cache.get(`twitch.id.${user}`) != null) {
      id = cache.get(`twitch.id.${user}`);
      this.app.log.verbose(module, `ID was cached: ${id}`);
    } else {
      this.app.log.verbose(module, 'ID not cached');
      const data = await this.fetchUser({ userName: user }).catch(err => this.app.log.warn(module, err));
      if (!data) throw new Error('User not fetched');
      id = data.id;
      cache.put(`twitch.id.${user}`, id);
    }
    return id;
  }

  /**
   * Fetch a follow object for the given user ID.
   * @param {number} userId the user id to check the follow for
   * @param {number} [streamerId=ApplicationOptions.twitch.channel?.id] the channel id to check if following
   * @returns {Promise<Object>}
   */
  follow(userId, streamerId = this.options.channel?.id) {
    this.app.log.debug(module, `Fetching follow: ${userId} to ${streamerId}`);
    return this.api.users.follows.get({ params: { from_id: userId, to_id: streamerId }, authID: streamerId, allowApp: true });
  }

  /**
   * Fetch the followers for a streamer
   * @param {number} [streamerId=ApplicationOptions.twitch.channel?.id] The id of the broadcaster to fetch follower count for
   * @param {boolean} [fullResponse=false] Whether to return the full data structure response
   * @returns {Promise<number|Object>}
   */
  fetchFollowers(streamerId = this.options.channel?.id, fullResponse = false) {
    this.app.log.debug(module, `Fetching followers: ${streamerId}`);
    return this.api.users.follows.get({ params: { to_id: streamerId }, authID: streamerId, allowApp: true }).then(res => (fullResponse ? res : res?.total));
  }

  /**
   * Fetch the stream for the application's channel ID.
   * @param {number} [options.userId=ApplicationOptions.twitch.channel?.id] fetch stream data from a specific user id
   * @param {string} [options.userName] fetch stream data from a specific user name
   * @returns {void}
   */
  fetchStream({ userId, userName } = {}) {
    if (typeof userId === 'undefined' && typeof userName === 'undefined') userId = this.options.channel?.id;
    this.app.log.debug(module, `Fetching stream: ${userName ?? userId}`);
    return this.api.streams.get({ params: { user_login: userName, user_id: userId }, authID: userId, allowApp: true });
  }

  /**
   * Fetch a user
   * @param {string} [options.userName] the login name to check
   * @param {number} [options.userId] the id of the nameto check
   * @returns {Promise<Object>}
   */
  fetchUser({ userName, userId } = {}) {
    if (typeof userName === 'undefined' && typeof userId === 'undefined') throw new RangeError('A query parameter must be specified');
    this.app.log.debug(module, `Fetching user: ${userName ?? userId}`);
    return this.api.users.get({ params: { login: userName, id: userId }, authID: userId, allowApp: true }).then(res => res.data?.[0]);
  }

  /**
   * Fetch the uptime for the specified stream.
   * @param {number} [options.userId=ApplicationOptions.twitch.channel?.id] the user id to fetch uptime for
   * @param {string} [options.userName] the user to fetch uptime for
   * @returns {Promise<number>}
   */
  fetchUptime({ userId, userName } = {}) {
    if (typeof userId === 'undefined' && typeof userName === 'undefined') userId = this.options.channel?.id;
    this.app.log.debug(module, `Fetching uptime: ${userName ?? userId}`);
    return this.fetchStream({ userId, userName }).then(body => {
      if (body.data?.[0] == null) return Promise.reject(new Error('Stream Offline')); // eslint-disable-line eqeqeq
      return moment(body.data[0].started_at).valueOf();
    });
  }

  /**
   * The function called before each axios request automatically
   * @param {Object} config The axios configuration generated for this request
   * @param {number} [config.authID] The id of the user whose auth token to use
   * @param {boolean} [config.allowApp] Whether to allow use of the app access token if the user token is not found
   * @returns {Object} config
   * @private
   */
  async _preRequest(config) {
    let token = await this.auth.getAccessToken(config.authID, true).catch(() => undefined);
    if (!token && config.allowApp) {
      token = await this.auth.getAccessToken(0, true);
    }
    if (typeof token === 'string') {
      config.headers.Authorization = `Bearer ${token}`;
      config.token = token;
    }
    let requestData = this._requests.get(token);
    if (!requestData) {
      this._requests.set(token, { promises: [], ratelimit: { limit: -1, remaining: -1, reset: -1 } });
      requestData = this._requests.get(token);
    }
    if (!config.isRetry) {
      await this._awaitQueue(requestData.promises);
    }

    if (requestData.ratelimit.remaining <= 0 && Date.now() < requestData.ratelimit.reset) {
      await new Promise(resolve => setTimeout(() => resolve, requestData.ratelimit.rest - Date.now()));
    }

    return config;
  }

  _awaitQueue(queue) {
    const waitFor = queue.length ? queue[queue.length - 1].promise : Promise.resolve();
    let resolve;
    const promise = new Promise(res => (resolve = res));

    queue.push({ resolve, promise });

    return waitFor;
  }

  _postRequest(response) {
    const requestData = this._requests.get(response.config?.token);
    if (response?.headers) {
      const offset = response.headers.date ? new Date(response.headers.date).getTime() - Date.now() : 0;
      requestData.ratelimit = {
        limit: response.headers['ratelimit-limit'] ? Number(response.headers['ratelimit-limit']) : Infinity,
        remaining: response.headers['ratelimit-remaining'] ? Number(response.headers['ratelimit-remaining']) : 1,
        reset: response.headers['ratelimit-reset'] ? new Date(Number(response.headers['ratelimit-reset'])).getTime() - offset : Date.now(),
      };
    }
    requestData.promises.shift()?.resolve();
    return response.data ?? response;
  }

  async _postErrorRequest(error) {
    const requestData = this._requests.get(error.config?.token);
    if (error.response?.status === 401 && error.response.config?.headers?.authorization) {
      await this.auth.getAccessToken(error.config.authID);
      const res = await this.driver
        .request({ isRetry: true, ...error.response.config })
        .catch(err => this.app.log.debug(module, 'Error during request after refreshing token', this.makeLoggable(err)));
      return res;
    }
    if (requestData?.promises) {
      requestData.promises.shift()?.resolve();
    }
    throw this.makeLoggable(error);
  }
}

module.exports = TwitchManager;
