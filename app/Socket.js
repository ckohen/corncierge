'use strict';

/**
 * Parent implementation for socket-based service classes.
 * @private
 */
class Socket {
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

module.exports = Socket;
