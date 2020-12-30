'use strict';

const BaseManager = require('./BaseManager');

/**
 * Parent implementation for event-driven service classes.
 * @extends {BaseManager}
 * @abstract
 */
class EventManager extends BaseManager {
  constructor(app, driver, options, events) {
    super(app, driver, options);

    /**
     * The events this driver handles
     * @type {Object}
     */
    this.events = events;
  }

  /**
   * Attach the event listeners to the socket.
   */
  attach() {
    if (!this.events) return;

    Object.entries(this.events).forEach(([event, listener]) => {
      this.listen(event, listener);
    });
  }

  /**
   * Listen for a socket event.
   * @param {string} event the name of the event to listen for
   * @param {Function} listener the function to call on event
   */
  listen(event, listener) {
    this.driver.on(event, (...args) => {
      listener(this, ...args);
    });
  }
}

module.exports = EventManager;
