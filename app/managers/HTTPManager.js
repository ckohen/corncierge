'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');

const EventManager = require('./EventManager');
const events = require('../http/events');
const RequestManager = require('../http/requests/RequestManager');

/**
 * HTTP manager for the application.
 * @extends {EventManager}
 */
class HTTPManager extends EventManager {
  constructor(app) {
    let driver;
    if (app.options.http.useHttps) {
      const opts = app.options.http.httpsOptions;
      if (app.options.http.locations) {
        opts.key = fs.readFileSync(app.options.http.locations.key);
        opts.cert = fs.readFileSync(app.options.http.locations.cert);
      }
      driver = https.createServer(opts);
    } else {
      driver = http.createServer();
    }
    super(app, driver, app.options.http, events);

    /**
     * The HTTP server.
     * @type {http.Server}
     * @name HTTPManager#driver
     */

    /**
     * The socket request events.
     * @type {Object}
     */
    this.requestsManager = new RequestManager(this);
  }

  /**
   * Initialize the manager.
   * @returns {Promise}
   */
  init() {
    this.app.log.debug(module, 'Registering events');
    this.attach();

    this.app.log.debug(module, 'Registering requests');
    /**
     * The requests for the socket, mapped by input. Only available after HTTPManager#init()
     * @type {Collection<string, BaseRequest>}
     */
    this.requests = this.requestsManager.registered;

    this.driver.requestTimeout = 2000;
    return this.driver.listen(this.options.port);
  }

  /**
   * Get the channel for the given slug.
   * @param {string} slug the username of the stream to get a notification channel for
   * @returns {?Channel}
   */
  getChannel(slug) {
    let user = this.app.streaming.get(`notification_${slug}`);
    if (!user) {
      return false;
    }
    let id = user.channel;
    return this.app.discord.driver.channels.cache.get(id);
  }

  /**
   * Get the message for the given slug.
   * @param {string} slug the username of the stream to get a notification message for
   * @returns {?Promise<Message>}
   */
  async getMessage(slug) {
    let user = this.app.streaming.get(`notification_${slug}`);
    if (!user) {
      return false;
    }
    let id = user.lastMessage;
    let channel = await this.app.discord.driver.channels.cache.get(user.channel);
    if (!channel) {
      return false;
    }
    return channel.messages.fetch(id);
  }

  /**
   * Get the role for the given slug.
   * @param {string} slug the username of the stream to get a notification role for
   * @param {Channel} channel a dicord js cached channel to get role data from
   * @returns {Role}
   */
  async getRole(slug, channel) {
    let user = this.app.streaming.get(`notification_${slug}`);
    if (!user) {
      return false;
    }
    let role = user.role;
    if (role !== '@here' && role !== '@everyone') {
      role = await channel.guild.roles.cache.get(role);
    }

    if (!role) {
      role = 'everyone';
    }
    return role;
  }

  /**
   * Update the messageID for stream stop editing
   * @param {string} slug the username of the stream to edit a notification for
   * @param {string} msgID the original snowflake message id
   * @returns {Promise<void>}
   */
  setMessage(slug, msgID) {
    let user = this.app.streaming.get(`notification_${slug}`);
    user.lastMessage = msgID;
    return this.app.database.tables.streaming.edit(`notification_${slug}`, msgID);
  }
}

module.exports = HTTPManager;
