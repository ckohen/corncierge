'use strict';

const RequestManager = require('../managers/RequestManager');

/**
 * Auth manager for the application.
 * @extends {RequestManager}
 */
class AuthManager extends RequestManager {
  constructor(app) {
    super(app, app.options.auth);

    /**
     * The Authentication handler.
     * @type {Object}
     * @name AuthManager#driver
     */
  }

  /**
   * Generates the twitch api tokens for the given slug
   * @param {string} slug the user to generate the token for (_code must be in database)
   * @returns {Promise<string>} token
   */
  async generateToken(slug) {
    try {
      const res = await this.api.token.post({
        params: {
          client_id: this.options.clientID,
          client_secret: this.options.clientSecret,
          code: slug === this.app.options.irc.identity.username ? this.options.botCode : this.app.database.get(`twitch_code_${slug}`),
          grant_type: 'authorization_code',
          redirect_uri: this.options.redirectUri,
        },
      });
      this.app.database.add('settings', [`twitch_access_${slug}`, res.data.access_token]);
      this.app.database.add('settings', [`twitch_refresh_${slug}`, res.data.refresh_token]);
      return res.data.access_token;
    } catch {
      return Promise.reject(new Error('Generate Token'));
    }
  }

  /**
   * Gets the twitch api access token for the given slug
   * @param {string} [slug=this.app.options.irc.identity.username] the user to get the token for
   * @returns {Promise<string>} token
   */
  async getAccessToken(slug = this.app.options.irc.identity.username) {
    const token = this.app.settings.get(`twitch_access_${slug}`);
    if (token) {
      if (await this.validateToken(token)) return token;
      return this.refreshToken(slug);
    }
    if (slug === this.app.options.irc.identity.username) {
      return this.generateToken(this.app.options.irc.identity.username);
    }
    return Promise.reject(new Error('Get Token'));
  }

  /**
   * Refreshes the tokens for the given slug
   * @param {string} slug the user to refresh the tokens for
   * @returns {Promise<string>} token
   */
  async refreshToken(slug) {
    try {
      const res = await this.api.token.post({
        params: {
          client_id: this.options.clientID,
          client_secret: this.options.clientSecret,
          refresh_token: this.app.settings.get(`twitch_refresh_${slug}`),
          grant_type: 'refresh_token',
        },
      });
      this.app.database.edit('settings', [`twitch_access_${slug}`, res.data.access_token]);
      this.app.database.edit('settings', [`twitch_refresh_${slug}`, res.data.refresh_token]);
      return res.data.access_token;
    } catch {
      return Promise.reject(new Error('Refresh Token'));
    }
  }

  /**
   * Validates the token provided
   * @param {string} token a twitch api token
   * @returns {Promise<boolean>}
   */
  async validateToken(token) {
    try {
      await this.api.validate.get({ headers: { Authorization: `OAuth ${token}` } });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AuthManager;
