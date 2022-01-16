'use strict';

const { Collection } = require('@discordjs/collection');
const CachedManager = require('./CachedManager');
const Channel = require('../structures/Channel');
const Stream = require('../structures/Stream');
const User = require('../structures/User');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for streams and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchStreamManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Stream, iterable);
  }

  _add(data, cache) {
    return super._add(data, cache, { id: data.user_id ?? data.broadcaster_user_id });
  }

  /**
   * The cache of this manager
   * @type {Collection<string, TwitchStream>}
   * @name TwitchStreamManager#cache
   */

  /**
   * Data that resolves to give a TwitchStream object. This can be:
   * * A TwitchStream object
   * * An id (string)
   * * A TwitchChannel object
   * * A TwitchUser object
   * @typedef {TwitchStream|string|TwitchChannel|TwitchUser} TwitchStreamResolvable
   */

  /**
   * The length of a commercial that can be served to viewers, one of:
   * * 30
   * * 60
   * * 80
   * * 120
   * * 150
   * * 180
   * @typedef {number} CommercialLength
   */

  /**
   * Data returned when starting a commercial
   * @typedef {Object} CommercialReturnData
   * @property {CommercialLength} length the length of the triggered commercial
   * @property {string} message an error message, if an error occured
   * @property {number} retryAfter the number of seconds until the next commercial can be served
   */

  /**
   * Starts a commercial for a stream on the specified channel
   * @param {TwitchChannelResolvable} channel the channel to start t he commercial on
   * @param {CommercialLength} length the length of the commercial to run
   * @returns {Promise<CommercialReturnData>}
   */
  async startCommercial(channel, length) {
    const id = this.resolveId(channel);
    if (!id) throw new Error(`Invalid channel id resolvable was provided: ${channel}`);

    const res = await this.client.rest.post('/channels/commercial', { body: { broadcaster_id: id, length }, authId: id, allowApp: false });

    return {
      length: res.length,
      message: res.message,
      retryAfter: res.retry_after,
    };
  }

  /**
   * Fetch the tags for the specified streamer
   * @param {TwitchChannelResolvable} channel the streamer to get tags for
   * @param {boolean} [cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<Collection<string,TwitchTag>>}
   */
  async fetchTags(channel, cache = true) {
    const params = new URLSearchParams();
    const id = this.resolveId(channel);
    if (!id) throw new Error(`Invalid channel id resolvable was provided: ${channel}`);
    params.append('broadcaster_id', id);

    const res = await this.client.rest.get('/streams/tags', { query: params });

    const tags = new Collection();
    for (const rawTag of res.data) {
      const tag = this.client.tags._add(rawTag, cache);
      tags.set(tag.id, tag);
    }
    this._add({
      user_id: id,
      tag_ids: [...tags.keys()],
    });
    return tags;
  }

  /**
   * Edits the tags on the specified stream
   * @param {TwitchChannelResolvable} channel the streamer to edit tags for
   * @param {TwitchTagResolvable[]} newTags the new tags to use (an empty array is valid)
   * @returns {Promise<TwitchStream>}
   */
  async editTags(channel, newTags) {
    const params = new URLSearchParams();
    const id = this.resolveId(channel);
    if (!id) throw new Error(`Invalid channel id resolvable was provided: ${channel}`);
    params.append('broadcaster_id', id);

    const tagIds = [];

    for (const tag of newTags) {
      const tagId = this.client.tags.resolveId(tag);
      if (!tagId) throw new TypeError(`Invalid channel id resolvable was provided: ${channel}`);
      tagIds.push(tagId);
    }

    await this.client.rest.put('/streams/tags', { query: params, body: { tag_ids: tagIds }, authId: id, allowApp: false });

    return this._add({
      user_id: id,
      tag_ids: tagIds,
    });
  }

  /**
   * Data returned from the API for mass stream data
   * @typedef {Object} TwitchStreamData
   * @property {Collection<string,TwitchStream>} streams the fetched streams
   * @property {?string} cursor the pagination cursor to get more streams
   */

  /**
   * Obtains one or multiple users from Twitch, or the cache if they're already available
   * @param {TwitchUserResolvable[]} [options.userIds] users to fetch
   * @param {string[]} [options.userLogins] login names for user to fetch
   * @param {TwitchCategoryResolvable} [options.category] oinly fetch streams in this category
   * @param {TwitchLanguageCode} [options.language] only fetch streams in this lanuage
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {string} [options.before] the value of the cursor used for pagination to get the previous page
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchStream|TwitchStreamData>}
   */
  async fetch({ userIds = [], userLogins = [], category, language, after, before, resultCount, force = false, cache = true } = {}) {
    if (!force) {
      const cachedStreams = new Collection();
      let shouldFetch = false;
      if (userIds.length === 0 && userLogins.length === 0) shouldFetch = true;
      if (!shouldFetch) {
        for (const user of userIds) {
          const stream = this.resolve(user);
          if (!stream) {
            shouldFetch = true;
            break;
          }
          cachedStreams.set(stream.id, stream);
        }
      }
      if (!shouldFetch) {
        for (const login of userLogins) {
          const user = this.client.users.cache.find(u => u.login === login);
          if (!user) {
            shouldFetch = true;
            break;
          }
          const stream = this.resolve(user.id);
          if (!stream) {
            shouldFetch = true;
            break;
          }
          cachedStreams.set(stream.id, stream);
        }
      }
      if (!shouldFetch) {
        return cachedStreams;
      }
    }

    const params = new URLSearchParams();
    for (const idResolvable of userIds) {
      const id = this.resolveId(idResolvable);
      if (!id) throw new TypeError(`Invalid id resolvable was provided: ${idResolvable}`);
      params.append('user_id', id);
    }
    for (const login of userLogins) {
      params.append('user_login', login);
    }
    if (category !== undefined) {
      const categoryId = this.client.categories.resolveId(category);
      if (!categoryId) throw new TypeError(`Invalid category id resolvable was provided: ${category}`);
      params.append('game_id', categoryId);
    }
    if (language !== undefined) params.append('language', language);
    if (after !== undefined) params.append('after', after);
    if (before !== undefined) params.append('before', before);
    if (resultCount !== undefined) params.append('first', resultCount);

    let authId;
    if (userIds.length === 1 && userLogins.length === 0) authId = this.resolveId(userIds[0]);
    const res = await this.client.rest.get('/streams', { query: params, authId });

    return _getResReturn(res, cache, this, 'streams');
  }

  /**
   *
   * @param {TwitchUserResolvable} user the user to fetch followed streams for
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<TwitchStreamData>}
   */
  async fetchFollowed(user, { after, resultCount, cache = true }) {
    const params = new URLSearchParams();
    const userId = this.resolveId(user);
    if (!userId) throw new TypeError(`Invalid id resolvable was provided: ${user}`);
    params.append('user_id', userId);
    if (after !== undefined) params.append('after', after);
    if (resultCount !== undefined) params.append('first', resultCount);

    const res = await this.client.rest.get('/streams/followed', { query: params, authId: userId, allowApp: false });

    const streams = new Collection();
    for (const rawStream of res.data) {
      const stream = this._add(rawStream, cache);
      streams.set(stream.id, stream);
    }
    return { streams, cursor: res.pagination?.cursor ?? null };
  }

  /**
   * Resolves a {@link TwitchStreamResolvable} to a {@link TwitchStream} object
   * @param {TwitchStreamResolvable} stream The TwitchStreamResolvable to identify
   * @returns {?TwitchStream}
   */
  resolve(stream) {
    if (stream instanceof Channel || stream instanceof User) return super.resolve(stream.id);
    return super.resolve(stream);
  }

  /**
   * Resolves a {@link TwitchStreamResolvable} to a {@link TwitchStream} id
   * @param {TwitchStreamResolvable} stream The TwitchStreamResolvable to identify
   * @returns {?string}
   */
  resolveId(stream) {
    if (stream instanceof Channel || stream instanceof User) return stream.id;
    return super.resolveId(stream);
  }
}

module.exports = TwitchStreamManager;
