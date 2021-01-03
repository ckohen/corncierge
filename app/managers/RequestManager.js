'use strict';

const axios = require('axios');
const BaseManager = require('./BaseManager');
const apiRouter = require('../api/APIRouter');

/**
 * Parent implementation for request-based service classes.
 * @extends {BaseManager}
 * @abstract
 */
class RequestManager extends BaseManager {
  constructor(app, options) {
    super(app, axios.create(options.config), options);
  }

  /**
   * API request shortcut.
   * @type {Requester}
   * @readonly
   */
  get api() {
    return apiRouter(this);
  }
}

module.exports = RequestManager;
