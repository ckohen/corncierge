'use strict';

/**
 * Manages the data and methods for a given API
 * @abstract
 */
class BaseManager {
  constructor(app, driver, options) {
    /**
     * The application that instantiated this Manager
     * @name BaseManager#app
     * @type {Application}
     * @readonly
     */
    Object.defineProperty(this, 'app', { value: app });

    /**
     * The options for this API manager
     * @type {Object}
     */
    this.options = options;

    /**
     * The driver that handles this managers API
     * @name BaseManager#driver
     * @type {Object}
     * @readonly
     */
    Object.defineProperty(this, 'driver', { value: driver });
  }
}

module.exports = BaseManager;
