'use strict';

const { EventEmitter } = require('node:events');
const { setTimeout, clearTimeout } = require('node:timers');
const { setTimeout: sleep } = require('node:timers/promises');
const { fetch } = require('undici');
const HTTPError = require('./HTTPError');
const TwitchAPIError = require('./TwitchAPIError');
const { DefaultAuthRestOptions, DefaultUserAgent } = require('../util/Constants');

const requestMethods = ['delete', 'get', 'patch', 'post', 'put'];

async function consumeBody(res) {
  if (res.body === null) return;
  // eslint-disable-next-line no-unused-vars, no-empty
  for await (const _chunk of res.body) {
  }
}

function parseResponse(res) {
  if (res.headers.get('Content-Type')?.startsWith('application/json')) {
    return res.json();
  }

  return res.arrayBuffer();
}

/**
 * Possible data to be given to an endpoint
 * @typedef {Object} AuthRequestOptions
 * @property {Object} [body] json data to serialize into the body
 * @property {Record<string,string>} [headers] additional headers to add
 * @property {boolean} [passThroughBody] whether to pass the body directly through to fetch
 * @property {boolean} [query] query string parameters to append to the endpoint
 */

/**
 * Possible data to be given to an endpoint, including method and uri
 * @private
 * @typedef {AuthRequestOptions} AuthInternalRequest
 * @property {string} fullRoute full uri to append
 * @property {string} method request method
 */

class AuthREST extends EventEmitter {
  constructor(options) {
    super();

    this.options = { ...DefaultAuthRestOptions, ...options };

    for (const method of requestMethods) {
      this[method] = (fullRoute, requestOptions) => this.request({ ...requestOptions, fullRoute, method });
    }
  }

  /**
   * Queues a request to be sent
   * @param {InternalRequest} request request data
   * @returns {Promise<unknown>}
   * @private
   */
  request(request) {
    const { url, fetchOptions } = this.resolveRequest(request);

    return this._runRequest(url, fetchOptions, { body: request.body });
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

  async _runRequest(url, options, extraData, retries = 0) {
    const method = options.method ?? 'get';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout).unref();

    let res;

    try {
      res = await fetch(url, { ...options, signal: controller.signal });
    } catch (err) {
      // Retry the specified number of times for possible timed out requests
      if (err instanceof Error && err.name === 'AbortError' && retries !== this.options.retries) {
        return this._runRequest(url, options, extraData, ++retries);
      }

      throw err;
    } finally {
      clearTimeout(timeout);
    }

    const reset = res.headers.get('Ratelimit-Reset');

    if (res.ok) {
      return parseResponse(res);
    } else if (res.status === 429) {
      consumeBody(res);
      this.debug(
        [
          'Encountered unexpected 429 rate limit',
          `  Method         : ${method}`,
          `  URL            : ${url}`,
          `  Retry After    : ${Number(reset) * 1000}ms`,
        ].join('\n'),
      );
      await sleep(Number(reset) * 1000);
      // Since this is not a server side issue, the next request should pass, so we don't bump the retries counter
      return this.runRequest(url, options, extraData, retries);
    } else if (res.status >= 500 && res.status < 600) {
      consumeBody(res);
      // Retry the specified number of times for possible server side isues
      if (retries !== this.manager.options.retries) {
        return this.runRequest(url, options, extraData, ++retries);
      }
      // We are out of retries, throw an error
      throw new HTTPError(res.statusText, res.costructor.name, res.status, method, url, extraData);
    } else if (res.status >= 400 && res.status < 500) {
      // The request w ill not succeed for some reason, parse the error (if any) returned from the api
      const data = await parseResponse(res);
      throw new TwitchAPIError(data, res.status, method, url, extraData);
    }
    consumeBody(res);

    // Fallback in the rare case a status code outside the range 300..=500 is returned
    return null;
  }
}

module.exports = AuthREST;
