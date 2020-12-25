'use strict';

const http = require('http');

const events = require('./events');
const requests = require('./requests');
const Socket = require('../Socket');

class HTTPManager extends Socket {
  /**
   * Create a new HTTPM manager instance.
   * @param {Application} app the application that instantiated this
   */
  constructor(app) {
    super();
    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The socket events.
     * @type {Object}
     */
    this.events = events;

    /**
     * The socket request events.
     * @type {Object}
     */
    this.requests = requests;

    /**
     * The OBS driver.
     * @type {?OBSWebSocket}
     */
    this.driver = http.createServer();
  }

  /**
   * Initialize the manager.
   * @returns {self}
   */
  init() {
    this.attach();
    this.driver.requestTimeout = 2000;
    return this.driver.listen(this.app.options.http.port);
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
    return this.app.database.edit('streaming', [`notification_${slug}`, msgID]);
  }
}

module.exports = HTTPManager;
