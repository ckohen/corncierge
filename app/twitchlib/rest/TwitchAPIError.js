'use strict';

/**
 * Represents an error from the Discord API.
 * @extends Error
 */
class TwitchAPIError extends Error {
  constructor(rawError, status, method, url, extraData) {
    super(rawError?.message);
    this.name = `${TwitchAPIError.name}${rawError?.error ? `[${rawError.error}]` : ''}`;

    this.rawError = rawError;

    /**
     * The HTTP method used for the request
     * @type {string}
     */
    this.method = method;

    /**
     * The url of the request that errored
     * @type {string}
     */
    this.url = url;

    /**
     * The status code of the response
     * @type {number}
     */
    this.status = status;

    /**
     * The data associated with the request that caused this error
     * @type {*}
     */
    this.body = extraData.body;
  }
}

module.exports = TwitchAPIError;
