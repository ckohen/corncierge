'use strict';

const { Collection } = require('@discordjs/collection');
const BaseClient = require('./BaseClient');
const { DefaultAuthOptions } = require('../util/Constants');

/**
 * The main hub for interacting with Twitch's Oauth2 Authorizatio
 * @extends {BaseClient}
 */
class TwitchAuthClient extends BaseClient {
  /**
   * @param {Object} options Options for the client
   * @param {Iterable} [iterable] auth details to add to cache immediately
   */
  constructor(options = {}, iterable) {
    super({ ...DefaultAuthOptions, ...options });

    this._validateOptions();

    /**
     * @typedef {Object} TwitchAuthData
     * @prop {number} id The id of this user
     * @prop {string} accessToken The access token for this user
     * @prop {string} refreshToken The refresh token for this user
     * @prop {Object|Array} scopes The scopes that are authorized for this user
     */

    /**
     * The cache of auth data
     * @type {Collection<string, TwitchAuthData>}
     */
    this.cache = new Collection();

    /**
     * Removes a user that is no longer authenticated
     * @typedef {Function} DeleteDatabaseAccessor
     * @param {string} id the id of the user whos token to remove
     * @returns {Promise<void>|void}
     */

    /**
     * Get all authenticated users
     * @typedef {Function} GetDatabaseAccessor
     * @returns {Promise<TwitchAuthData[]>|TwitchAuthData[]}
     */

    /**
     * Get a single authenticated users
     * @typedef {Function} GetSingleDatabaseAccessor
     * @param {string} id the id of the user whos authentication data to retrieve
     * @returns {Promise<TwitchAuthData>|TwitchAuthData}
     */

    /**
     * Add or update an authenticated user
     * @typedef {Function} UpsertDatabaseAccessor
     * @param {string} id The id of the user this token belongs to
     * @param {string} access The access token for this user
     * @param {string} refresh The refresh token for this user
     * @param {Object|Array} scopes The scopes that are authorized for this user
     * @returns {Promise<void>|void}
     */

    /**
     * Add or update multiple authenticated users
     * @typedef {Function} UpsertMultipleDatabaseAccessor
     * @param {TwitchAuthData[]} data the data for all the users to upsert
     * @returns {Promise<void>|void}
     */

    /**
     * An object / class used to manipulate the database from within the auth client
     * @typedef {Object} TwitchAuthDatabaseAccessor
     * @property {DeleteDatabaseAccessor} delete function called to delete a single entry from the database
     * @property {GetDatabaseAccessor} get function called when a list of the entire database is desired
     * @property {GetSingleDatabaseAccessor} getSingle function called to get a single entry from the database
     * @property {UpsertDatabaseAccessor} upsert function called when an upsert to the database is desired
     * @property {UpsertMultipleDatabaseAccessor} upsertMultiple function called when an upsert of a large number of entries to the database is desired
     */

    /**
     * An access point to utilize a database to store keys
     * @type {TwitchAuthDatabaseAccessor}
     * @private
     */
    this.database = null;

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }

  /**
   * Sets the database accessor to automatically handle database management
   * @param {TwitchAuthDatabaseAccessor} database the database accessor to set
   */
  setDatabaseAccessor(database) {
    if (typeof database !== 'object' || database === null) throw new TypeError('Database Accessor must be a Object (or class)');
    this.database = database;
    this.setCache();
  }

  /**
   * Adds auth data to cache and database if provided
   * @param {TwitchAuthData} data data to add to cache and database if provided
   * @returns {TwitchAuthData}
   * @private
   */
  async _add(data) {
    /**
     * Emitted when a token is added or updated, useful if you want to manage your own database
     * @event TwitchAuthClient#tokenUpsert
     * @param {TwitchAuthData} data the new or updated token information
     */
    this.emit('tokenUpsert', data);
    await this.database?.upsert(data.id, data.accessToken, data.refreshToken, data.scopes);
    this.cache.set(data.id, data);
    return data;
  }

  /**
   * Generates a twitch api token using the code provided
   * @param {string} code the oauth code to generate tokens from
   * @returns {Promise<string>} token
   */
  async generateToken(code) {
    this.emit('debug', `Generating token with code ${code}`);
    const res = await this.rest.post('/token', {
      query: new URLSearchParams({
        client_id: this.options.clientId,
        client_secret: this.options.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.options.redirectUri,
      }),
    });
    const validated = await this.validateToken(res.data.access_token, true);
    if (!validated) throw new Error('Token generated successfully but post validation failed');
    this.emit('debug', `Succesful Generation`);
    const resolvedData = {
      id: validated.user_id,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? null,
      scopes: validated.scopes,
    };
    await this._add(resolvedData);
    return resolvedData.accessToken;
  }

  /**
   * Generates the twitch api app access token for this app
   * @returns {Promise<string>} token
   */
  async generateAppToken() {
    this.emit('debug', `Generating app access token`);
    const res = await this.rest.post('/token', {
      query: new URLSearchParams({
        client_id: this.options.clientId,
        client_secret: this.options.clientSecret,
        grant_type: 'client_credentials',
        scope: 'channel:edit:commercial channel:read:hype_train channel:manage:broadcast clips:edit',
      }),
    });
    this.emit('debug', 'Succesful app generation');
    const resolvedData = {
      id: '0',
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? null,
      scopes: res.data.scope,
    };
    await this._add(resolvedData);
    return resolvedData.accessToken;
  }

  /**
   * Gets the twitch api access token for the given user id
   * @param {string} [id='0'] the id of the user to get the token for, or `0` for the app access token
   * @param {boolean} [skipValidation=false] whether to skip the validation request and just return the cached token
   * @returns {Promise<string>} token
   */
  async getAccessToken(id = '0', skipValidation = false) {
    this.emit('debug', `Getting access token for ${id}`);
    const token = this.cache.get(id)?.accessToken ?? (await this.database?.getSingle(id))?.accessToken;
    if (token) {
      if (skipValidation) return token;
      if (await this.validateToken(token)) return token;
      if (id === '0') return this.generateAppToken();
      return this.refreshToken(id);
    }
    if (id === '0') return this.generateAppToken();
    throw new Error(`Token not found for user id ${id}`);
  }

  /**
   * Refreshes the tokens for the given id
   * @param {string} id the user id to refresh the tokens for
   * @returns {Promise<string>} token
   * @private
   */
  async refreshToken(id) {
    const refresh = this.cache.get(id)?.refreshToken ?? (await this.database?.getSingle(id))?.refreshToken;
    if (!refresh) throw new Error(`Refresh token not found for user id ${id}`);
    this.emit('debug', `Refreshing Access Token for id ${id}`);
    const res = await this.rest
      .post('/token', {
        query: new URLSearchParams({
          client_id: this.options.clientId,
          client_secret: this.options.clientSecret,
          refresh_token: refresh,
          grant_type: 'refresh_token',
        }),
      })
      .catch(err => {
        if (err.status === 401) {
          /**
           * Emitted when a token is deleted for any reason, useful if you want to manage your own database
           * @event TwitchAuthClient#tokenDelete
           * @param {string} data.id the id of the user who's token is being deleted
           * @param {string} data.reason the reason for the deletion
           */
          this.emit('tokenDelete', { id, reason: 'Authorization revoked' });
          this.database?.delete(id);
          this.cache.delete(id);
        }
        throw err;
      });
    const validated = await this.validateToken(res.data.access_token, true);
    if (!validated) throw new Error('Token refreshed successfully but post validation failed');
    this.emit('debug', `Succesful Refresh`);
    const resolvedData = {
      id,
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token ?? null,
      scopes: validated.scopes,
    };
    await this._add(resolvedData);
    return resolvedData.accessToken;
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
      this.emit('debug', 'Validating token');
      const res = await this.api.get('/validate', { headers: { Authorization: `OAuth ${token}` } });
      this.emit('debug', 'Token valid');
      return fullResponse ? res.data : true;
    } catch (error) {
      this.emit('debug', 'Token Invalid');
      /**
       * Emitted when a token is determined to be invalid
       * @event TwitchAuthClient#invalidToken
       * @param {Error} error the error that was received indicating the token is invalid
       */
      this.emit('invalidToken', error);
      return false;
    }
  }

  /**
   * Set the cache of twitch authenticated users and synchronises to the database
   * @returns {Promise}
   */
  async setCache() {
    this.emit('debug', 'Caching Authentication');
    if (this.cache.size) {
      await this.database?.upsertMultiple([...this.cache.values()]);
    }
    const data = await this.database?.get();
    if (!data) return;
    this.cache.clear();
    if (data.length === 0) return;
    for (const auth of data) {
      this.cache.set(auth.id, auth);
    }
  }

  /**
   * Validates the client options.
   * @param {Object} [options=this.options] Options to validate
   * @private
   */
  _validateOptions(options = this.options) {
    if (typeof options.clientId !== 'string') {
      throw new TypeError('The clientId option must be a string');
    }
    if (typeof options.clientSecret !== 'string') {
      throw new TypeError('The clientSecret option must be a string');
    }
    if (typeof options.redirectUri !== 'string') {
      throw new TypeError('The redirectUri option must be a string');
    }
  }
}

module.exports = TwitchAuthClient;
