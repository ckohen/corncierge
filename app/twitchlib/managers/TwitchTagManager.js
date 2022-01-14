'use strict';

const { Collection } = require('discord.js');
const TwitchCachedManager = require('./TwitchCachedManager');
const TwitchTag = require('../structures/TwitchTag');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for tags and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchTagManager extends TwitchCachedManager {
  constructor(socket, iterable) {
    super(socket, TwitchTag, iterable);
  }

  _add(data, cache) {
    return super._add(data, cache, { id: data.tag_id });
  }

  /**
   * The cache of this manager
   * @type {Collection<string,TwitchTag>}
   * @name TwitchTagManager#cache
   */

  /**
   * Data that resolves to give a TwitchTag object. This can be:
   * * A TwitchTag object
   * * An id (string)
   * @typedef {TwitchTag|string} TwitchTagResolvable
   */

  /**
   * Data returned from the API for mass tag data
   * @typedef {Object} TagData
   * @property {Collection<string,TwitchTag>} tags the fetched tags
   * @property {?string} cursor the pagination cursor to get more tags
   */

  /**
   * Obtains one or multiple tags from Twitch, or the cache if they're already available
   * @param {TwitchTagResolvable[]} [options.tags] specific tags to fetch
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchTag|TagData>}
   */
  async fetch({ tags = [], resultCount, after, force = false, cache = true } = {}) {
    if (!force) {
      const cachedTags = new Collection();
      let shouldFetch = false;
      if (tags.length === 0) shouldFetch = true;
      if (!shouldFetch) {
        for (const id of tags) {
          const tag = this.resolve(id);
          if (!tag) {
            shouldFetch = true;
            break;
          }
          cachedTags.set(tag.id, tag);
        }
      }
      if (!shouldFetch) {
        return cachedTags;
      }
    }

    const params = new URLSearchParams();
    for (const idResolvable of tags) {
      const id = this.resolveId(idResolvable);
      if (!id) throw new TypeError(`Invalid id resolvable was provided: ${idResolvable}`);
      params.append('tag_id', id);
    }
    if (after !== undefined) params.append('after', after);
    if (resultCount !== undefined) params.append('first', resultCount);

    const res = await this.socket.rest.get('/tags/streams', { query: params });

    return _getResReturn(res, cache, this, 'tags');
  }
}

module.exports = TwitchTagManager;
