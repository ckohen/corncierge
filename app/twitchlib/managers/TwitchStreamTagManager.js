'use strict';

const TwitchDataManager = require('./TwitchDataManager');
const TwitchTag = require('../structures/TwitchTag');

class TwitchStreamTagManager extends TwitchDataManager {
  constructor(stream) {
    super(stream.socket, TwitchTag);

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
    return this.socket.tags.cache.filter(tag => this.stream._tags.includes(tag.id));
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
   * @returns {Promise<Collection<string,TwitchTag>>}
   */
  fetch() {
    return this.socket.streams.fetchTags(this.stream.id);
  }

  /**
   * Edits the tags on this stream, up to 5 non-automatic tags
   * @param {TwitchTagResolvable[]} newTags the list of new tags
   * @returns {Promise<TwitchStream>}
   */
  edit(newTags) {
    return this.socket.streams.editTags(this.id, newTags);
  }
}

module.exports = TwitchStreamTagManager;
