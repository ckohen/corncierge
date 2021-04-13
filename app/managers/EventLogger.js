'use strict';

const EventEmitter = require('events');

/**
 * An event emitter that emits whenever major events - worthy of logging - occur on a platform.
 */
class EventLogger extends EventEmitter {
  constructor(app, options) {
    super({ captureRejections: true });

    /**
     * The application that instantiated this Log emitter
     * @name EventLogger#app
     * @type {Application}
     * @readonly
     */
    Object.defineProperty(this, 'app', { value: app });

    /**
     * The options for this API manager
     * @type {Object}
     */
    this.options = options;

    this.on('error', err => this.app.log.error(module, err));
  }
}

module.exports = EventLogger;
