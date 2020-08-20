'use strict';

const moment = require('moment');
const cache = require('memory-cache');
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
   * @param {Application} app
   * @returns {self}
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
   * @param {Function} callback
   */
  channel(callback) {
    this.get(`channels/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get a follow object for the given user ID.
   * @param {number} userId
   * @returns {Promise<Request>}
   */
  follow(userId) {
    return this.promise(`users/${userId}/follows/channels/${this.opts.twitch.channel.id}`);
  }

  /**
   * Get the stream for the application's channel ID.
   * @param {Function} callback
   */
  stream(callback) {
    this.get(`streams/${this.opts.twitch.channel.id}`, {}, callback);
  }

  /**
   * Get a user for the given login name.
   * @param {string} name
   * @param {Function} callback
   */
  user(name, callback) {
    this.get(`users?login=${name}`, {}, callback);
  }

  /**
   * Get the uptime for the application's stream.
   * @param {Function} callback
   * @param {boolean} [readOnly]
   */
  uptime(callback, readOnly = false) {
    const cached = cache.get('stream.uptime');

    if (cached !== null) {
      callback(cached);
      return;
    }

    this.stream((body) => {
      // Channel not live
      if (body.stream === null) return callback();

      // Stream start timestamp in milliseconds
      const time = moment(body.stream.created_at).valueOf();

      if (!readOnly) {
        const fiveMins = 300000;
        cache.put('stream.uptime', time, fiveMins);
      }

      callback(time);
    });
  }
}

module.exports = ApiManager;
