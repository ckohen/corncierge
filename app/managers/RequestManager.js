'use strict';

const axios = require('axios');
const BaseManager = require('./BaseManager');
const apiRouter = require('../util/APIRouter');

/**
 * Parent implementation for request-based service classes.
 * @extends {BaseManager}
 * @abstract
 */
class RequestManager extends BaseManager {
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
}

module.exports = RequestManager;
