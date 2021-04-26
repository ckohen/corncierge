'use strict';

const axios = require('axios');
const BaseManager = require('./BaseManager');
const apiRouter = require('../util/APIRouter');

/**
 * Parent implementation for API request-based service classes.
 * @extends {BaseManager}
 * @abstract
 */
class APIManager extends BaseManager {
  constructor(app, options) {
    super(app, axios.create(options.apiConfig), options);
  }

  /**
   * API request shortcut.
   * @type {Requester}
   * @readonly
   * @private
   */
  get api() {
    return apiRouter(this);
  }

  /**
   * API Request handler
   * @param {HTTPMethod} method The HTTP  method used to make this request
   * @param {string} uri The uri of the desired endpoint
   * @param {Object} data The data to pass to the request
   * @returns {Promise<Object>}
   * @private
   */
  _request(method, uri, data) {
    return this.driver.request({
      method,
      url: uri,
      ...data,
    });
  }
}

module.exports = APIManager;
