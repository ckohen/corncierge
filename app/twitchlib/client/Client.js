'use strict';

const AuthClient = require('./AuthClient');
const BaseClient = require('./BaseClient');
const CategoryManager = require('../managers/CategoryManager');
const ChannelManager = require('../managers/ChannelManager');
const StreamManager = require('../managers/StreamManager');
const TagManager = require('../managers/TagManager');
const TeamManager = require('../managers/TeamManager');
const UserManager = require('../managers/UserManager');
const { DefaultOptions } = require('../util/Constants');

/**
 * The main hub for interacting with the Twitch API
 * @extends {BaseClient}
 */
class TwitchClient extends BaseClient {
  /**
   * @param {Object} options Options for the client
   */
  constructor(options = {}) {
    super({ ...DefaultOptions, ...options });

    this._validateOptions();

    /**
     * The auth client used when not using custom auth, provides all necessary implementation for this clients REST
     * @type {?TwitchAuthClient}
     */
    this.auth = this.options.customAuth ? null : new AuthClient(this.options.auth);

    /**
     * All of the {@link TwitchCategory} objects that have been cached at any point, mapped by their ids
     * @type {TwitchCategoryManager}
     */
    this.categories = new CategoryManager(this);

    /**
     * All of the {@link TwitchChannel} objects that have been cached at any point, mapped by their ids
     * @type {TwitchChannelManager}
     */
    this.channels = new ChannelManager(this);

    /**
     * All of the {@link TwitchStream} objects that have been cached at any point, mapped by their ids
     * @type {TwitchStreamManager}
     */
    this.streams = new StreamManager(this);

    /**
     * All of the {@link TwitchTag} objects that have been cached at any point, mapped by their ids
     * @type {TwitchTagManager}
     */
    this.tags = new TagManager(this);

    /**
     * All of the {@link TwitchTeam} objects that have been cached at any point, mapped by their ids
     * @type {TwitchTeamManager}
     */
    this.teams = new TeamManager(this);

    /**
     * All of the {@link TwitchUser} objects that have been cached at any point, mapped by their ids
     * @type {TwitchUserManager}
     */
    this.users = new UserManager(this);

    /**
     * @type {?Function}
     * @private
     */
    this.getToken = null;

    if (!this.options.customAuth) {
      this.setTokenFunction(this.auth.getAccessToken.bind(this.auth));
    }
  }

  /**
   * Set a function to get tokens that can bed used to make requests
   * @param {Function} fn a function (awaited) that takes a string id ('0' for app access) and a boolean, returns an access token
   * it should not prevalidate requests when passed true as its second parameter, only validating and refreshing when passed false
   * @returns {TwitchClient}
   */
  setTokenFunction(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Expected a function to set token function to');
    }
    this.getToken = fn;
    this.rest.setTokenFunction(fn);
    return this;
  }

  /**
   * Validates the client options.
   * @param {Object} [options=this.options] Options to validate
   * @private
   */
  _validateOptions(options = this.options) {
    if (typeof options.rest !== 'object' || options.rest === null) {
      throw new TypeError('The rest option must be an object');
    }
    if (typeof options.customAuth !== 'boolean') {
      throw new TypeError('The customAuth option must be a boolean');
    }
    if (!options.customAuth && (typeof options.auth !== 'object' || options.auth === null)) {
      throw new TypeError('The auth option must be an object');
    }
  }
}

module.exports = TwitchClient;
