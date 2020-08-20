'use strict';

/**
 * Parent implementation for request-based service classes.
 * @private
 */
class Request {
  /**
   * Create a new request promise.
   * @param {string} uri
   * @param {string} [method]
   * @param {Object} [body]
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
   * @param {string} uri
   * @param {string} [method]
   * @param {Object} [body]
   * @param {Function} [callback]
   */
  call(uri, method = 'GET', body = {}, callback = null) {
    this.promise(uri, method, body).then((...args) => {
      if (typeof callback !== 'function') return;
      callback(...args);
    }).catch((err) => {
      this.app.log.out('error', module, err);
    });
  }

  /**
   * Make a GET request.
   * @param {string} uri
   * @param {Object} body
   * @param {Function} callback
   */
  get(uri, body, callback) {
    this.call(uri, 'GET', body, callback);
  }

  /**
   * Make a POST request.
   * @param {string} uri
   * @param {Object} body
   * @param {Function} callback
   */
  post(uri, body, callback) {
    this.call(uri, 'POST', body, callback);
  }
}

module.exports = Request;
