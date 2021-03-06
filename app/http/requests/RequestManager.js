'use strict';

const { Collection } = require('discord.js');
const BaseRequest = require('./BaseRequest');

/**
 * Stores the requests for a http manager
 */
class RequestManager {
  constructor(socket) {
    /**
     * The http manager that handles these requests
     * @name RequestManager#socket
     * @type {HTTPManager}
     * @private
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The registered requests, mapped by name
     * @type {Collection<string, BaseRequest>}
     * @private
     */
    this.registered = new Collection();

    this.register(require('./renewCert'), '/api/private/certbot/');
    this.registerGroup(require('./streaming'), 'streaming');
    for (const group of require('./api')) {
      if (Array.isArray(group)) {
        this.registerGroup(group, 'api');
        continue;
      }
      if (typeof group === 'object') {
        this.registerGroup(group.requests, `api/${group.name}`);
      }
    }
    this.register(require('./success'));
  }

  /**
   * Registers a group of requests
   * @param {BaseRequest[]} requests the requests to register
   * @param {string} group the group to which this request resides, the group name is prepended in the url path e.g. group/request
   */
  registerGroup(requests, group) {
    for (const request of requests) {
      this.register(request, `/${group}/`);
    }
  }

  /**
   * Registers a request in the manager for use throughout the application
   * @param {BaseRequest} request the request to register
   * @param {string} [prefix='/'] the prefix to use when checking the uri
   */
  register(request, prefix = '/') {
    const handler = new request(this.socket);
    if (!(handler instanceof BaseRequest)) throw new TypeError(`HTTP requests must extend BaseRequest: ${request.name}`);
    this.registered.set(`${prefix}${handler.name}`.toLowerCase(), handler);
  }
}

module.exports = RequestManager;
