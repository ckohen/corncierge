'use strict';

const EventEmitter = require('node:events');
const { clearInterval } = require('node:timers');
const AuthREST = require('../rest/AuthREST');
const REST = require('../rest/REST');
const Util = require('../util/Util');

/**
 * The base class for all clients.
 * @extends {EventEmitter}
 */
class TwitchBaseClient extends EventEmitter {
  constructor(options = {}) {
    super({ captureRejections: true });

    if (typeof options !== 'object' || options === null) {
      throw new TypeError('Supplied options is not an object');
    }

    /**
     * The options the client was instantiaed with
     * @type {Object}
     */
    this.options = options;

    /**
     * The REST manager of the client
     * @type {TwitchREST|AuthREST}
     */
    this.rest = options.restType === 'auth' ? new AuthREST(this.options.rest) : new REST(this.options.rest);
  }

  /**
   * Destroys all assets used by the client.
   * @returns {void}
   */
  destroy() {
    if (this.rest.handlerSweepTimer) clearInterval(this.rest.handlerSweepTimer);
  }

  toJSON(...props) {
    return Util.flatten(this, { domain: false }, ...props);
  }
}

module.exports = TwitchBaseClient;

/**
 * Emitted for general debugging information.
 * @event TwitchBaseClient#debug
 * @param {string} info The debug information
 */
