'use strict';

/**
 * Parent implementation for request-based service classes.
 * @private
 */
class Request {
  /**
   * An HTTP fetch method, one of:
   * * GET (default)
   * * PATCH
   * * POST
   * * PUT
   * * DELETE
   * @typedef {string} HTTPMethod
   */

  /**
   * Create a new request promise.
   * @param {string} uri the extended path to request
   * @param {HTTPMethod} [method] the http method
   * @param {Object} [body] the body to use for this request
   * @returns {Promise<Request>}
   */
  promise(uri, method = 'GET', body = {}) {
    return this.driver({
      uri,
      body,
      method,
      json: true,
    });
  }

  /**
   * Make a request.
   * @param {string} uri the extended path to request
   * @param {HTTPMethod} [method] the http method
   * @param {Object} [body] the body to use for this request
   * @param {Function} [callback] a function to call with the returned data
   */
  call(uri, method = 'GET', body = {}, callback = null) {
    this.promise(uri, method, body)
      .then((...args) => {
        if (typeof callback !== 'function') return;
        callback(...args);
      })
      .catch(err => {
        this.app.log.error(module, err);
      });
  }

  /**
   * Make a GET request.
   * @param {string} uri the extended path to request
   * @param {Object} body the body to use for this request
   * @param {Function} callback a function to call with the returned data
   */
  get(uri, body, callback) {
    this.call(uri, 'GET', body, callback);
  }

  /**
   * Make a POST request.
   * @param {string} uri the extended path to request
   * @param {Object} body the body to use for this request
   * @param {Function} callback a function to call with the returned data
   */
  post(uri, body, callback) {
    this.call(uri, 'POST', body, callback);
  }
}

module.exports = Request;
