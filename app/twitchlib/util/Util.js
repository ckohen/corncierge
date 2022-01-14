'use strict';

const { Collection } = require('discord.js');

class Util extends null {
  /**
   * Gets the return value from a single or multi point endpoint
   * @param {unknown} res the response from twitch
   * @param {boolean} cache whether to cache the fetched data if it wasn't already
   * @param {TwitchCachedManager} manager the manager to add data to
   * @param {string} [key] the name of the key for object returns, if not provided returns the collection
   * @returns {unknown}
   */
  static _getResReturn(res, cache, manager, key) {
    if (res.data.length < 1) return null;
    if (res.data.length === 1) return manager._add(res.data[0], cache);

    const objs = new Collection();
    for (const rawObj of res.data) {
      const obj = manager._add(rawObj, cache);
      objs.set(obj.id, obj);
    }
    if (!key) return objs;
    return { [key]: objs, cursor: res.pagination?.cursor ?? null };
  }
}

module.exports = Util;
