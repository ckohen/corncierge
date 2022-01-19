'use strict';

/**
 * Represents an HTTP error from a request.
 * @extends Error
 */
class HTTPError extends Error {
  constructor(message, name, status, method, url, extraData) {
    super(message);

    /**
     * The name of the error
     * @type {string}
     */
    this.name = name;

    /**
     * HTTP error code returned from the request
     * @type {number}
     */
    this.status = this.status ?? 500;

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
     * The data associated with the request that caused this error
     * @type {*}
     */
    this.body = extraData.body;
  }
}

module.exports = HTTPError;
