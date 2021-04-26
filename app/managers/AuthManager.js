'use strict';

const { Collection } = require('discord.js');
const APIManager = require('./APIManager');
const { collect } = require('../util/UtilManager');

/**
 * Auth manager for the application.
 * @extends {APIManager}
 */
class AuthManager extends APIManager {
  constructor(app, twitch) {
    super(app, twitch.options.auth);

    /**
     * The Authentication handler.
     * @type {Axios}
     * @name AuthManager#driver
     * @private
     */

    /**
     * The Twitch manager that instantiated this.
     * @name AuthManager#twitch
     * @type {TwitchManager}
     * @readonly
     */
    Object.defineProperty(this, 'twitch', { value: twitch });

    /**
     * @typedef {Object} TwitchAuthData
     * @prop {number} id The id of this user
     * @prop {string} accessToken The access token for this user
     * @prop {string} refreshToken The refresh token for this user
     * @prop {Object|Array} scopes The scopes that are authorized for this user
     */

    /**
     * The cache of auth data
     * @type {Collection<number, TwitchAuthData>}
     */
    this.cache = new Collection();
  }

  /**
   * Generates the twitch api tokens using the code provided
   * @param {string} code the oauth code to generate tokens from
   * @returns {Promise<string>} token
   * @private
   */
  async generateToken(code) {
    this.app.log.verbose(module, `Generating token with code ${code}`);
    const res = await this.api.token.post({
      params: {
        client_id: this.options.clientID,
        client_secret: this.options.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.options.redirectUri,
      },
    });
    this.app.log.verbose(module, 'Successful Generation');
    const validateRes = await this.validateToken(res.data.access_token, true);
    if (!validateRes) throw new Error();
    await this.app.database.tables.twitchAuth.add(validateRes.user_id, res.data.access_token, res.data.refresh_token ?? null, validateRes.scopes ?? null);
    this.cache.set(validateRes.user_id, {
      id: validateRes.user_id,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? null,
      scopes: validateRes.scopes,
    });
    this.app.log.verbose(module, 'Added tokens to database.');
    return res.data.access_token;
  }

  /**
   * Generates the twitch api app access token for this app
   * @returns {Promise<string>} token
   */
  async generateAppToken() {
    this.app.log.verbose(module, `Generating app access token`);
    const res = await this.api.token.post({
      params: {
        client_id: this.options.clientID,
        client_secret: this.options.clientSecret,
        grant_type: 'client_credentials',
        scope: 'channel:edit:commercial channel:read:hype_train channel:manage:broadcast clips:edit',
      },
    });
    this.app.log.verbose(module, `Successful Generation`);
    const cached = this.cache.has(0);
    let method = 'edit';
    if (!cached) method = 'add';
    await this.app.database.tables.twitchAuth[method](0, res.data.access_token, res.data.refresh_token ?? null, res.data.scope ?? null);
    this.cache.set(0, {
      id: 0,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      scopes: res.data.scope,
    });
    this.app.log.verbose(module, 'Updated tokens to database');
    return res.data.access_token;
  }

  /**
   * Gets the twitch api access token for the given user id
   * @param {number} [id=0] the id of the user to get the token for, or 0 for the app access token
   * @param {boolean} [skipValidation=false] whether to skip the validation request and just return the cached token
   * @returns {Promise<string>} token
   */
  async getAccessToken(id = 0, skipValidation = false) {
    this.app.log.verbose(module, `Getting access token for ${id}`);
    const token = this.cache.get(id)?.accessToken;
    if (token) {
      if (skipValidation) return token;
      if (await this.validateToken(token)) return token;
      if (id === 0) return this.generateAppToken();
      return this.refreshToken(id);
    }
    if (id === 0) return this.generateAppToken();
    throw new Error(`Token not found for user id ${id}`);
  }

  /**
   * Refreshes the tokens for the given id
   * @param {number} id the user id to refresh the tokens for
   * @returns {Promise<string>} token
   * @private
   */
  async refreshToken(id) {
    const refresh = this.cache.get(id)?.refreshToken;
    if (!refresh) throw new Error(`Refresh token not found for user id ${id}`);
    this.app.log.verbose(module, `Refreshing Access Token for id ${id}`);
    const res = await this.api.token
      .post({
        params: {
          client_id: this.options.clientID,
          client_secret: this.options.clientSecret,
          refresh_token: refresh,
          grant_type: 'refresh_token',
        },
      })
      .catch(err => {
        if (err.response?.status === 401) {
          this.app.database.tables.twitchAuth.delete(id);
          this.cache.delete(id);
          throw new Error('Refresh Token: Authorization Removed');
        }
        throw err;
      });
    const validateRes = await this.validateToken(res.data.access_token, true);
    if (!validateRes) throw new Error();
    this.app.log.verbose(module, 'Successfully refreshed.');
    await this.app.database.tables.twitchAuth.edit(id, res.data.access_token, res.data.refresh_token ?? null, validateRes.scopes);
    this.cache.set(id, {
      id,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? null,
      scopes: validateRes.scopes,
    });
    this.app.log.verbose(module, 'Updated Database with refreshed tokens.');
    return res.data.access_token;
  }

  /**
   * Validates the token provided
   * @param {string} token a twitch api token
   * @param {boolean} [fullResponse=false] whether to return the full response when successful
   * @returns {Promise<boolean>}
   * @private
   */
  async validateToken(token, fullResponse = false) {
    try {
      this.app.log.debug(module, 'Validating token.');
      const res = await this.api.validate.get({ headers: { Authorization: `OAuth ${token}` } });
      this.app.log.debug(module, 'Token valid.');
      return fullResponse ? res.data : true;
    } catch (error) {
      this.app.log.debug(module, 'Token Invalid.');
      return false;
    }
  }

  /**
   * Set the cache of twitch authenticated users.
   * @returns {Promise}
   */
  setCache() {
    this.app.log.debug(module, 'Caching Twitch Authentication');
    return this.app.database.tables.twitchAuth.get().then(all => {
      this.cache.clear();
      collect(this.cache, all, 'id');
    });
  }
}

module.exports = AuthManager;
