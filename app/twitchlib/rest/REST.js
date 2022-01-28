'use strict';

const { EventEmitter } = require('node:events');
const { setInterval } = require('node:timers');
const { Collection } = require('@discordjs/collection');
const RequestQueue = require('./RequestQueue');
const { DefaultRestOptions, DefaultUserAgent } = require('../util/Constants');

const requestMethods = ['delete', 'get', 'patch', 'post', 'put'];

/**
 * Possible data to be given to an endpoint
 * @typedef {Object} RequestOptions
 * @property {boolean} [auth=true] whether to set authorization for this request
 * @property {string} [authId] the id of a user to attempt to authorize as
 * @property {boolean} [allowApp=true] whether to allow using an app access token for this request
 * @property {Object} [body] json data to serialize into the body
 * @property {Record<string,string>} [headers] additional headers to add
 * @property {boolean} [passThroughBody] whether to pass the body directly through to fetch
 * @property {boolean} [query] query string parameters to append to the endpoint
 */

/**
 * Possible data to be given to an endpoint, including method and uri
 * @private
 * @typedef {RequestOptions} InternalRequest
 * @property {string} fullRoute full uri to append
 * @property {string} method request method
 */

class REST extends EventEmitter {
  constructor(options) {
    super();

    this.options = { ...DefaultRestOptions, ...options };
    this.options.offset = Math.max(0, this.options.offset);

    this.handlers = new Collection();

    for (const method of requestMethods) {
      this[method] = (fullRoute, requestOptions) => this.request({ ...requestOptions, fullRoute, method });
    }

    this.getToken = null;

    if (this.options.handlerSweepInterval !== 0 && this.options.handlerSweepInterval !== Infinity) {
      if (this.options.handlerSweepInterval > 14_400_000) {
        throw new RangeError('Cannot set an interval greater than 4 hours');
      }
      this.handlerSweepTimer = setInterval(() => {
        const swept = new Collection();

        this.handlers.sweep((v, k) => {
          const { inactive } = v;

          if (inactive) {
            swept.set(k, v);
          }

          return inactive;
        });

        this.emit('handlerSweep', swept);
      }, this.options.handlerSweepInterval).unref();
    }
  }

  /**
   * Set a function to get tokens rest can use
   * @param {Function} fn a function (awaited) that takes a string id ('0' for app access) and a boolean, returns an access token
   * it should not prevalidate requests when passed true as its second parameter, only validating and refreshing when passed false
   * @returns {TwitchREST}
   */
  setTokenFunction(fn) {
    this.getToken = fn;
    return this;
  }

  /**
   * Queues a request to be sent
   * @param {InternalRequest} request request data
   * @returns {Promise<unknown>}
   * @private
   */
  async request(request) {
    let handlerId = 'global';
    let token;
    if (request.auth !== false) {
      // eslint-disable-next-line eqeqeq
      if (request.authId != null && request.authId !== '') {
        try {
          token = await this.getToken(request.authId, true);
          handlerId = request.authId;
        } catch {
          this.emit('debug', `No access token found for id: ${request.authId}, trying app access if allowed`);
        }
      }
      if (!token && request.allowApp !== false) {
        try {
          token = await this.getToken('0', true);
          handlerId = 'application';
        } catch {
          this.emit('debug', `No app access token found, early exiting request`);
        }
      }
      if (!token) {
        throw new Error(`Authorization requested for request to ${request.fullRoute}, no token found`);
      }
    }

    const handler = this.handlers.get(handlerId) ?? this.createHandler(handlerId, token);

    const { url, fetchOptions } = this.resolveRequest(request);

    return handler.queueRequest(url, fetchOptions, { body: request.body, auth: { use: request.auth !== false, allowApp: request.allowApp !== false } });
  }

  createHandler(handlerId, token) {
    const queue = new RequestQueue(this, handlerId, token);
    this.handlers.set(queue.id, queue);
    return queue;
  }

  resolveRequest(request) {
    const { options } = this;

    let query = '';

    // If a query option is passed, use it
    if (request.query) {
      query = `?${request.query}`;
    }

    const headers = {
      ...options.headers,
      'User-Agent': `${DefaultUserAgent} ${options.userAgentAppendix}`,
    };

    // Format the full request URL (api base, endpoint, optional querystring)
    const url = `${options.api}${request.fullRoute}${query}`;

    let finalBody;
    let additionalHeaders;

    // eslint-disable-next-line eqeqeq
    if (request.body != null) {
      if (request.passThroughBody) {
        finalBody = request.body;
      } else {
        // Stringify JSON data
        finalBody = JSON.stringify(request.body);
        // Set content type header
        additionalHeaders = { 'Content-Type': 'application/json' };
      }
    }

    const fetchOptions = {
      body: finalBody,
      headers: { ...(request.headers ?? {}), ...additionalHeaders, ...headers },
      method: request.method,
    };

    return { url, fetchOptions };
  }
}

module.exports = REST;
