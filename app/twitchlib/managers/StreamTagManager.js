'use strict';

const DataManager = require('./DataManager');
const Tag = require('../structures/Tag');

/**
 * Manages API methods for the tags of a stream and stores their cache
 * @extends {TwitchDataManager}
 */
class TwitchStreamTagManager extends DataManager {
  constructor(stream) {
    super(stream.client, Tag);

    /**
     * The stream this manager belongs to
     * @type {TwitchStream}
     */
    this.stream = stream;
  }

  /**
   * The tags of this stream
   * @type {Collection<string,TwitchTag>}
   * @readonly
   */
  get cache() {
    return this.client.tags.cache.filter(tag => this.stream._tags.includes(tag.id));
  }

  /**
   * Whether the cache of tags has all the tags on this stream
   * @type {boolean}
   * @readonly
   */
  get cacheComplete() {
    return this.cache.size >= this.stream._tags.length;
  }

  /**
   * Fetch the complete list of tags currently on this stream
   * @param {boolean} [cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<Collection<string,TwitchTag>>}
   */
  fetch(cache = true) {
    return this.client.streams.fetchTags(this.stream.id, cache);
  }

  /**
   * Edits the tags on this stream, up to 5 non-automatic tags
   * @param {TwitchTagResolvable[]} newTags the list of new tags (an empty array is valid)
   * @returns {Promise<TwitchStream>}
   */
  edit(newTags) {
    return this.client.streams.editTags(this.id, newTags);
  }
}

module.exports = TwitchStreamTagManager;
