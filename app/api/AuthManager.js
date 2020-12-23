'use strict';

const axios = require('axios').default;
const qs = require('qs');

/**
 * Auth manager for the application.
 * @private
 */
class AuthManager {
    /**
     * Create a new Auth manager instance.
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
         * The Auth driver.
         * @type {Function}
         */
        this.driver = axios.create(this.opts.auth.config);
    }

    /**
     * Generates the token for the given slug
     * @param {string} slug
     * @returns {Promise<string>} token
     */
    async generateToken(slug) {
        try {
            const res = await this.driver.post('/token', qs.stringify({
                client_id: this.opts.auth.clientID,
                client_secret: this.opts.auth.clientSecret,
                code: slug === this.opts.irc.identity.username.slice(1, -1)
                    ? this.opts.auth.botCode
                    : this.app.database.get(`twitch_code_${slug}`),
                grant_type: 'authorization_code',
                redirect_uri: this.opts.auth.redirectUri,
            }));
            if (199 < res.status < 300) {
                this.app.database.add('settings', [`twitch_access_${slug}`, res.data.access_token]);
                this.app.database.add('settings', [`twitch_refresh_${slug}`, res.data.refresh_token]);
                return res.data.access_token;
            }
            return Promise.reject(new Error('Generate Token'));
        }
        catch {
            return Promise.reject(new Error('Generate Token'));
        }
    }

    /**
     * Gets the access token for the given slug
     * @param {string} slug
     * @returns {Promise<string>} token
     */
    async getAccessToken(slug) {
        let token = this.app.settings.get(`twitch_access_${slug}`)
        if (token) {
            if (await this.validateToken(token)) return token;
            return this.refreshToken(slug);
        }
        if (slug === this.opts.irc.identity.username.slice(1, -1)) {
            return this.generateToken(this.opts.irc.identity.username.slice(1, -1));
        }
        return Promise.reject(new Error('Get Token'));
    }

    /**
     * Refreshes the token for the given slug
     * @param {string} slug 
     * @returns {Promise<string>} token
     */
    async refreshToken(slug) {
        try {
            const res = await this.driver.post('/token', qs.stringify({
                client_id: this.opts.auth.clientID,
                client_secret: this.opts.auth.clientSecret,
                refresh_token: this.app.settings.get(`twitch_refresh_${slug}`),
                grant_type: 'refresh_token',
            }));
            if (199 < res.status < 300) {
                this.app.database.edit('settings', [`twitch_access_${slug}`, res.data.access_token]);
                this.app.database.edit('settings', [`twitch_refresh_${slug}`, res.data.refresh_token]);
                return res.data.access_token;
            }
            return Promise.reject(new Error('Refresh Token'));
        }
        catch {
            return Promise.reject(new Error('Refresh Token'));
        }
    }

    /**
     * Validates the token provided
     * @param {string} token
     * @returns {Promise<boolean>}
     */
    async validateToken(token) {
        try {
            const res = await this.driver.get('/validate', { headers: { Authorization: `OAuth ${token}` } })
            if (199 < res.status < 300) {
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
}

module.exports = AuthManager;
