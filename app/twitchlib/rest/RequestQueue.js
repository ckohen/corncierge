'use strict';

const { setTimeout, clearTimeout } = require('node:timers');
const { setTimeout: sleep } = require('node:timers/promises');
const { AsyncQueue } = require('@sapphire/async-queue');
const { fetch } = require('undici');
const HTTPError = require('./HTTPError');
const TwitchAPIError = require('./TwitchAPIError');

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

class RequestQueue {
  constructor(manager, id, token) {
    this.manager = manager;
    this.id = id;
    this.token = token;

    /**
     * The time this rate limit bucket will reset
     */
    this.reset = -1;
    /**
     * The remaining requests that can be made before we are rate limited
     */
    this.remaining = 1;
    /**
     * The total number of requests that can be made before we are rate limited
     */
    this.limit = Infinity;

    this.queue = new AsyncQueue();
  }

  /**
   * If the bucket is currently inactive (no pending requests)
   * @type {boolean}
   * @readonly
   */
  get inactive() {
    return this.queue.remaining === 0 && !this.limited;
  }

  /**
   * If the rate limit bucket is currently limited
   * @type {boolean}
   * @readonly
   */
  get limited() {
    return this.remaining <= 0 && Date.now() < this.reset;
  }

  /**
   * The time until queued requests can continue
   * @type {number}
   * @readonly
   */
  get timeToReset() {
    return this.reset + this.manager.options.offset - Date.now();
  }

  debug(message) {
    this.manager.emit('restDebug', `[REST ${this.id}] ${message}`);
  }

  async queueRequest(url, options, extraData) {
    // Wait for any previous requests to be completed before this one is run
    await this.queue.wait();
    try {
      // Make the request, and return the results
      return this.runRequest(url, options, extraData);
    } finally {
      // Allow the next request to fire
      this.queue.shift();
    }
  }

  async runRequest(url, options, extraData, retries = 0, authRetry = false) {
    while (this.limited) {
      const delay = sleep(this.timeToReset, undefined, { ref: false });

      this.manager.emit('rateLimited', { timeToReset: this.timeToReset, limit: this.limit, method: options.method ?? 'get', url, bucketId: this.id });
      this.debug(`Waiting ${this.timeToReset}ms for rate limit to pass`);
      // Wait the remaining time left before the rate limit resets
      // eslint-disable-next-line no-await-in-loop
      await delay;
    }

    // Last second set token here so that an updated token takes affect
    if (extraData.auth.use) {
      if (!this.token) {
        if (this.id === 'application' || this.id === 'global' || !extraData.auth.allowApp) {
          throw new Error(`Authorization requested for request to ${url}, token is no longer valid`);
        }
        let handler = this.manager.handlers.get('application');
        if (!handler) {
          const token = await this.manager.getToken('0', true);
          handler = this.manager.createHandler('application', token);
        }
        return handler.queueRequest(url, options, extraData);
      }

      options.headers.Authorization = `Bearer ${this.token}`;
    }

    const method = options.method ?? 'get';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.manager.options.timeout).unref();

    let res;

    try {
      res = await fetch(url, { ...options, signal: controller.signal });
    } catch (err) {
      // Retry the specified number of times for possible timed out requests
      if (err instanceof Error && err.name === 'AbortError' && retries !== this.manager.options.retries) {
        return this.runRequest(url, options, extraData, ++retries, authRetry);
      }

      throw err;
    } finally {
      clearTimeout(timeout);
    }

    const date = res.headers.get('Date');
    const serverOffset = date ? Date.parse(date) - Date.now() : 0;

    const limit = res.headers.get('Ratelimit-Limit');
    const remaining = res.headers.get('Ratelimit-Remaining');
    const reset = res.headers.get('Ratelimit-Reset');

    // Update the total number of requests that can be made before the rate limit resets
    this.limit = limit ? Number(limit) : Infinity;
    // Update the number of remaining requests that can be made before the rate limit resets
    this.remaining = remaining ? Number(remaining) : 1;
    // Update the time whe nthis rate limit resets (reset is in seconds)
    this.reset = reset ? Number(reset) * 1000 - serverOffset + this.manager.options.offset : Date.now();

    if (res.ok) {
      return parseResponse(res);
    } else if (res.status === 429) {
      consumeBody(res);
      this.debug(
        [
          'Encountered unexpected 429 rate limit',
          `  Method         : ${method}`,
          `  URL            : ${url}`,
          `  Bucket id      : ${this.id}`,
          `  Limit          : ${this.limit}`,
          `  Retry After    : ${Number(reset) * 1000}ms`,
        ].join('\n'),
      );
      // Since this is not a server side issue, the next request should pass, so we don't bump the retries counter
      return this.runRequest(url, options, extraData, retries, authRetry);
    } else if (res.status >= 500 && res.status < 600) {
      consumeBody(res);
      // Retry the specified number of times for possible server side isues
      if (retries !== this.manager.options.retries) {
        return this.runRequest(url, options, extraData, ++retries, authRetry);
      }
      // We are out of retries, throw an error
      throw new HTTPError(res.statusText, res.costructor.name, res.status, method, url, extraData);
    } else if (res.status >= 400 && res.status < 500) {
      // If we receive this status code, it means the token we had is no longer valid or is not authorized for this resource.
      // Try again after validating the token, if not done already
      if (res.status === 401 && !authRetry && this.id !== 'global') {
        consumeBody(res);
        const token = await this.manager
          .getToken(this.id === 'application' ? '0' : this.id, false)
          .catch(err => this.debug(`Failed attempt to refresh token for ${this.id}: ${err}`));
        this.token = token ?? null;
        return this.runRequest(url, options, extraData, retries, true);
      }
      // The request w ill not succeed for some reason, parse the error (if any) returned from the api
      const data = await parseResponse(res);
      throw new TwitchAPIError(data, res.status, method, url, extraData);
    }
    consumeBody(res);

    // Fallback in the rare case a status code outside the range 300..=500 is returned
    return null;
  }
}

module.exports = RequestQueue;
