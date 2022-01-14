'use strict';

const { Collection } = require('discord.js');
const TwitchCachedManager = require('./TwitchCachedManager');
const TwitchCategory = require('../structures/TwitchCategory');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for categories / games and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchCategoryManager extends TwitchCachedManager {
  constructor(socket, iterable) {
    super(socket, TwitchCategory, iterable);
  }

  /**
   * The cache of this manager
   * @type {Collection<string, TwitchCategory>}
   * @name TwitchCategoryManager#cache
   */

  /**
   * Data that resolves to give a TwitchCategory object. This can be:
   * * A TwitchCategory object
   * * An id (string)
   * @typedef {TwitchCategory|string} TwitchCategoryResolvable
   */

  /**
   * Obtains one or multiple categories from Twitch, or the cache if they're already available
   * <warn>One of ids or names is required</warn>
   * @param {TwitchCategoryResolvable[]} [options.ids] categories to fetch
   * @param {string[]} [options.names] exact name matches for categories to fetch
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchCategory|Collection<string,TwitchCategory>>}
   */
  async fetch({ ids = [], names = [], force = false, cache = true } = {}) {
    if (!force) {
      const cachedCategories = new Collection();
      let shouldFetch = false;
      if (!shouldFetch) {
        for (const id of ids) {
          const category = this.resolve(id);
          if (!category) {
            shouldFetch = true;
            break;
          }
          cachedCategories.set(category.id, category);
        }
      }
      if (!shouldFetch) {
        for (const name of names) {
          const category = this.cache.find(c => c.name === name);
          if (!category) {
            shouldFetch = true;
            break;
          }
          cachedCategories.set(category.id, category);
        }
      }
      if (!shouldFetch) {
        return cachedCategories;
      }
    }

    const params = new URLSearchParams();
    for (const idResolvable of ids) {
      const id = this.resolveId(idResolvable);
      if (!id) throw new TypeError(`Invalid id resolvable was provided: ${idResolvable}`);
      params.append('id', id);
    }
    for (const name of names) {
      params.append('name', name);
    }
    const res = await this.socket.rest.get('/games', { query: params });

    return _getResReturn(res, cache, this);
  }

  /**
   * Data returned from the API for mass category data
   * @typedef {Object} CategoryData
   * @property {Collection<string,TwitchCategory>} categories the fetched categories
   * @property {?string} cursor the pagination cursor to get more categories
   */

  /**
   * Obtains the list of top categories from Twitch
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {string} [options.before] the value of the cursor used for pagination to get the previous page
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchCategory|CategoryData>}
   */
  async fetchTop({ after, before, resultCount, cache = true } = {}) {
    const params = new URLSearchParams();
    if (after !== undefined) params.append('after', after);
    if (before !== undefined) params.append('before', before);
    if (resultCount !== undefined) params.append('first', resultCount);

    const res = await this.socket.rest.get('/games/top', { query: params });

    return _getResReturn(res, cache, this, 'categories');
  }

  /**
   * Obtains the list of categories matching the search query partially or entirely from Twitch
   * @param {string} query the search query
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchCategory|CategoryData>}
   */
  async search(query, { after, resultCount, cache = true } = {}) {
    const params = new URLSearchParams();
    params.append('query', query);
    if (after !== undefined) params.append('after', after);
    if (resultCount !== undefined) params.append('first', resultCount);

    const res = await this.socket.rest.get('/search/categories', { query: params });
    return _getResReturn(res, cache, this, 'categories');
  }
}

module.exports = TwitchCategoryManager;
