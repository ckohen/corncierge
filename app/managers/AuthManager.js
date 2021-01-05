'use strict';

const RequestManager = require('./RequestManager');

/**
 * Auth manager for the application.
 * @extends {RequestManager}
 */
class AuthManager extends RequestManager {
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
  }

  /**
   * Generates the twitch api tokens for the given slug
   * @param {string} slug the user to generate the token for (_code must be in database)
   * @returns {Promise<string>} token
   * @private
   */
  async generateToken(slug) {
    try {
      this.app.log.debug(module, `Generating token for ${slug}`);
      const res = await this.api.token.post({
        params: {
          client_id: this.options.clientID,
          client_secret: this.options.clientSecret,
          code: slug === this.twitch.options.irc.identity.username ? this.options.botCode : this.app.settings.get(`twitch_code_${slug}`),
          grant_type: 'authorization_code',
          redirect_uri: this.options.redirectUri,
        },
      });
      this.app.log.debug(module, 'Successfull Generation');
      this.app.database.tables.settings.add(`twitch_access_${slug}`, res.data.access_token);
      this.app.database.tables.settings.add(`twitch_refresh_${slug}`, res.data.refresh_token);
      this.app.log.debug(module, 'Added tokens to database.');
      return res.data.access_token;
    } catch {
      return Promise.reject(new Error('Generate Token'));
    }
  }

  /**
   * Gets the twitch api access token for the given slug
   * @param {string} [slug=ApplicationOptions.twitch.irc.identity.username] the user to get the token for
   * @returns {Promise<string>} token
   */
  async getAccessToken(slug = this.twitch.options.irc.identity.username) {
    this.app.log.debug(module, `Getting access token for ${slug}`);
    const token = this.app.settings.get(`twitch_access_${slug}`);
    if (token) {
      if (await this.validateToken(token)) return token;
      return this.refreshToken(slug);
    }
    return this.generateToken(slug);
  }

  /**
   * Refreshes the tokens for the given slug
   * @param {string} slug the user to refresh the tokens for
   * @returns {Promise<string>} token
   * @private
   */
  async refreshToken(slug) {
    try {
      this.app.log.debug(module, `Refreshing Access Token for ${slug}`);
      const res = await this.api.token.post({
        params: {
          client_id: this.options.clientID,
          client_secret: this.options.clientSecret,
          refresh_token: this.app.settings.get(`twitch_refresh_${slug}`),
          grant_type: 'refresh_token',
        },
      });
      this.app.log.debug(module, 'Successfully refreshed.');
      this.app.database.tables.settings.edit(`twitch_access_${slug}`, res.data.access_token);
      this.app.database.tables.settings.edit(`twitch_refresh_${slug}`, res.data.refresh_token);
      this.app.log.debug(module, 'Updated Database with refreshed tokens.');
      return res.data.access_token;
    } catch {
      return Promise.reject(new Error('Refresh Token'));
    }
  }

  /**
   * Validates the token provided
   * @param {string} token a twitch api token
   * @returns {Promise<boolean>}
   * @private
   */
  async validateToken(token) {
    try {
      this.app.log.debug(module, 'Validating token.');
      await this.api.validate.get({ headers: { Authorization: `OAuth ${token}` } });
      this.app.log.debug(module, 'Token valid.');
      return true;
    } catch (error) {
      this.app.log.debug(module, 'Token Invalid.');
      return false;
    }
  }
}

module.exports = AuthManager;
