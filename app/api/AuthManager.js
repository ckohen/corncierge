'use strict';

const axios = require('axios').default;
const qs = require('qs');

/**
 * Auth manager for the application.
 * @private
 */
class AuthManager {
    /**
     * Create a new API manager instance.
     * @param {Application} app
     * @returns {self}
    */
    constructor(app) {
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
        this.driver = axios.create(this.opts.auth.config);
    }

    /**
     * Generates the token for the IRC user
     * @returns {?string} token or false
     */
    async generateToken() {
        const res = await this.driver.post('/token', qs.stringify({
            client_id: this.opts.auth.clientID,
            client_secret: this.opts.auth.clientSecret,
            code: this.opts.auth.botCode,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost',
        }));
        if (199 < res.status < 300) {
            this.app.database.add('settings', [`twitch_access_${this.opts.irc.identity.username}`, res.data.access_token]);
            this.app.database.add('settings', [`twitch_refresh_${this.opts.irc.identity.username}`, res.data.refresh_token]);
            return res.data.access_token;
        }
        return false;
    }

    /**
     * Gets the access token for the given slug
     * @param {string} slug
     * @returns {?string} token or false
     */
    async getAccessToken(slug) {
        let token = this.app.settings.get(`twitch_access_${slug}`)
        if (token) {
            if (await this.validateToken(token)) return token;
            return this.refreshToken(slug);
        }
        if (slug === this.opts.irc.identity.username) {
            return this.generateToken();
        }
        return false;
    }

    /**
     * Refreshes the token for the given slug
     * @param {string} slug 
     * @returns {string} token
     */
    async refreshToken(slug) {
        const res = await this.driver.post('/token', qs.stringify({
            client_id: this.opts.auth.clientID,
            client_secret: this.opts.auth.clientSecret,
            refresh_token: this.app.settings.get(`twitch_refresh_${slug}`),
            grant_type: 'refresh_token',
        }));
        if (199 < res.status < 300) {
            this.app.database.edit('settings', [`twitch_access_${this.opts.irc.identity.username}`, res.data.access_token]);
            this.app.database.edit('settings', [`twitch_refresh_${this.opts.irc.identity.username}`, res.data.refresh_token]);
            return res.data.access_token;
        }
        return false;
    }

    /**
     * Validates the token provided
     * @param {string} token
     * @returns {boolean}
     */
    async validateToken(token) {
        const res = await this.driver.get('/validate', { headers: {Authorization: `OAuth ${token}`}});
        if (199 < res.status < 300) {
            return true;
        }
        return false;
    }
}

module.exports = AuthManager;
