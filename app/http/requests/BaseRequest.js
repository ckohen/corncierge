'use strict';

/**
 * Represents a request that can be made
 * @abstract
 */
class BaseRequest {
  /**
   * Data that defines a request
   * @typedef {Object} RequestData
   * @param {string} name the name of the request (used to register the request as useable)
   * @param {string | string[]} methods the allowable HTTP methods for this endpoint
   * @param {string} [description] what the request does
   * @param {boolean} [responds] whether this handler responds, will automatically respond with 202 if this is false
   */

  /**
   * Create a new request
   * @param {HTTPManager} socket the handler that will call the request
   * @param {RequestData} data the data that defines the request
   */
  constructor(socket, data) {
    if (typeof data !== 'object') throw new TypeError('The data to construct the request must be an object');

    /**
     * The discord manager that calls this request
     * @name BaseRequest#socket
     * @type {HTTPManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });

    /**
     * The base name for this request, how the request is called via the web (may be prefixed if registered that way)
     * @name BaseRequest#name
     * @type {string}
     */
    Object.defineProperty(this, 'name', { value: data.name });

    /**
     * The acceptable methods to this request endpoint
     * @name BaseRequest#methods
     * @type {string[]}
     */
    Object.defineProperty(this, 'methods', { value: !Array.isArray(data.methods) ? [data.methods] : data.methods });

    if ('description' in data) {
      /**
       * What this request does
       * @name BaseRequest#description
       * @type {?string}
       */
      Object.defineProperty(this, 'description', { value: data.description });
    }

    if ('responds' in data) {
      /**
       * Whether this request has a built in response
       * @name BaseRequest#responds
       * @type {?boolean}
       */
      Object.defineProperty(this, 'responds', { value: data.responds });
    }
  }

  /**
   * Data used to respond to a request if responds = true in RequestData
   * @typedef {Object} RespondData
   * @property {Number} statusCode the status code to return
   * @property {Object} [headers] the headers to return
   * @property {*} [data] the data to respond with
   */

  /**
   * Runs the request
   * @param {string} method the method used to fetch this request
   * @param {string} url the full uri of the request
   * @param {Object} headers the headers sent with this request
   * @param {?string} data the data recieved with the request
   * @returns {?(RespondData|Promise<RespondData>)} the data to respond with
   * @abstract
   */
  run() {
    throw new Error('Must be implemented by subclass');
  }
}

module.exports = BaseRequest;
