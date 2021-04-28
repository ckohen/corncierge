'use strict';

const axios = require('axios');
const { HTTPError } = require('discord.js');
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

  /**
   * Makes a request error more readable in logs.
   * @param {Object} error the original error
   * @returns {HTTPError}
   */
  makeLoggable(error) {
    const err = new HTTPError(error.message, error.constructor?.name, error.response?.status, error.config?.method, error.config?.url);
    if (error.isAxiosError) {
      if (error.config?.baseURL) {
        err.baseURL = error.config.baseURL;
      }
      if (error.response?.data) {
        err.response = error.response.data;
      }
    }
    return err;
  }
}

module.exports = APIManager;
