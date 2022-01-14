'use strict';

const TwitchBaseManager = require('./TwitchBaseManager');

/**
 * Manages the API methods of a data model along with a collection of instances.
 * @extends {TwitchBaseManager}
 * @abstract
 */
class TwitchDataManager extends TwitchBaseManager {
  constructor(socket, holds) {
    super(socket);

    /**
     * The data structure belonging to this manager.
     * @name TwitchDataManager#holds
     * @type {Function}
     * @private
     * @readonly
     */
    Object.defineProperty(this, 'holds', { value: holds });
  }

  /**
   * The cache of items for this manager.
   * @type {Collection}
   * @abstract
   */
  get cache() {
    throw new Error(`Method get cache not implemented on ${this.constructor.name}`);
  }

  /**
   * Resolves a data entry to a data Object.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Object} An instance from this Manager
   */
  resolve(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  /**
   * Resolves a data entry to an instance id.
   * @param {string|Object} idOrInstance The id or instance of something in this Manager
   * @returns {?Snowflake}
   */
  resolveId(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance.id;
    if (typeof idOrInstance === 'string') return idOrInstance;
    return null;
  }

  valueOf() {
    return this.cache;
  }
}

module.exports = TwitchDataManager;
