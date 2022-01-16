'use strict';

const { Collection } = require('discord.js');
const DataManager = require('./DataManager');

/**
 * Manages the API methods of a data model with a mutable cache of instances.
 * @extends {TwitchDataManager}
 * @abstract
 */
class TwitchCachedManager extends DataManager {
  constructor(client, holds, iterable) {
    super(client, holds);

    /**
     * The cache of itmes for this manager.
     * @type {Collection}
     */
    this.cache = new Collection();

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }

  _add(data, cache = true, { id, extras = [] } = {}) {
    const existing = this.cache.get(id ?? data.id);
    if (existing) {
      if (cache) {
        existing._patch(data);
        return existing;
      }
      const clone = existing._clone();
      clone._patch(data);
      return clone;
    }

    const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
    if (cache) this.cache.set(id ?? entry.id, entry);
    return entry;
  }
}

module.exports = TwitchCachedManager;
