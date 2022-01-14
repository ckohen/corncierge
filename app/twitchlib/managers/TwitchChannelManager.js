'use strict';

const { Collection } = require('discord.js');
const TwitchCachedManager = require('./TwitchCachedManager');
const TwitchChannel = require('../structures/TwitchChannel');
const TwitchChannelEditor = require('../structures/TwitchChannelEditor');
const TwitchStream = require('../structures/TwitchStream');
const TwitchSubscription = require('../structures/TwitchSubscription');
const TwitchUser = require('../structures/TwitchUser');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for channels and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchChannelManager extends TwitchCachedManager {
  constructor(socket, iterable) {
    super(socket, TwitchChannel, iterable);
  }

  _add(data, cache) {
    return super._add(data, cache, { id: data.broadcaster_id ?? data.broadcaster_user_id });
  }

  /**
   * The cache of this manager
   * @type {Collection<string,TwitchChannel>}
   * @name TwitchChannelManager#cache
   */

  /**
   * Data that resolves to give a TwitchChannel object. This can be:
   * * A TwitchChannel object
   * * An id (string)
   * * A TwitchUser object
   * * A TwitchStream object
   * @typedef {TwitchChannel|string|TwitchUser|TwitchStream} TwitchChannelResolvable
   */

  /**
   * Data returned from the API for mass follow data
   * @typedef {Object} UserFollowData
   * @property {number} total the total number of follows for this user or streamer
   * @property {TwitchFollow[]} follows the array of actual follows
   * @property {?string} cursor the pagination cursor to get more follow data
   */

  /**
   * Fetch the list of users that have editor permissions for the specified channel
   * @param {TwitchChannelResolvable} channel the channel to get editors for
   * @returns {Promise<Collection<string,TwitchChannelEditor>>}
   */
  async fetchEditors(channel) {
    const id = this.resolveId(channel);
    if (!id) throw new TypeError(`Invalid id resolvable was provided: ${channel}`);

    const params = new URLSearchParams();
    params.append('broadcaster_id', id);

    const res = await this.socket.rest.get('/channels/editors', { query: params, authId: id, allowApp: false });

    const editors = new Collection();

    for (const rawEditor of res.data) {
      const editor = new TwitchChannelEditor(this.socket, rawEditor);
      editors.set(editor.id, editor);
    }

    return editors;
  }

  /**
   * Data returned from the API for mass subscription data
   * @typedef {Object} ChannelSubscriptionData
   * @property {number} total the total number of subscriptions to this channel
   * @property {number} points the total number of subscription points earned
   * @property {TwitchSubscription[]} subscriptions the array of actual subscriptions
   * @property {?string} cursor the pagination cursor to get more subscription data
   */

  /**
   * @typedef {Object} FetchSubscriptionsOptions
   * @property {TwitchUserResolvable[]} [options.users] A list of users to filter to in the result
   * @property {number} [options.resultCount] the number of results to return, up to 100
   * @property {string} [options.after] the value of the cursor used for pagination to get the next page
   */

  /**
   * Fetch data for subscriptions to a streamer
   * @param {TwitchChannelResolvable} streamer the channel to get subscription data for
   * @param {FetchSubscriptionsOptions} [options] additional options
   * @returns {Promise<ChannelSubscriptionData>}
   */
  async fetchSubscriptions(streamer, { users = [], resultCount, after } = {}) {
    const params = new URLSearchParams();
    const id = this.resolveId(streamer);
    if (!id) throw new Error(`Invalid channel id resolvable was provided: ${streamer}`);
    params.append('broadcaster_id', id);

    for (const user of users) {
      const userId = this.socket.users.resolveId(user);
      if (!userId) throw new Error(`Invalid user id resolvable was provided: ${user}`);
      params.append('user_id', userId);
    }
    if (resultCount !== undefined) params.append('first', resultCount);
    if (after !== undefined) params.append('after', after);

    const res = await this.socket.rest.get('/subscriptions', { query: params, authId: id });

    if (res.total === 0) return null;
    if (res.total === 1) return new TwitchSubscription(this.socket, res.data[0]);

    const subscriptions = [];
    for (const rawSubscription of res.data) {
      const subscription = new TwitchSubscription(this.socket, rawSubscription);
      subscriptions.push(subscription);
    }
    return { total: res.total, points: res.points, subscriptions, cursor: res.pagination?.cursor ?? null };
  }

  /**
   * Obtains a channel from Twitch, or the cache if it's already available
   * @param {TwitchChannelResolvable} channel channel to fetch
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchChannel|Collection<string,TwitchUser>>}
   */
  async fetch(channel, { force = false, cache = true } = {}) {
    const id = this.resolveId(channel);
    if (!id) throw new TypeError(`Invalid id resolvable was provided: ${channel}`);
    if (!force) {
      const cached = this.resolve(id);
      if (!cached) {
        return cached;
      }
    }

    const params = new URLSearchParams();
    params.append('broadcaster_id', id);

    const res = await this.socket.rest.get('/channels', { query: params, authId: id });

    return this._add(res.data[0], cache);
  }

  /**
   * Data returned from the API for mass channel data
   * @typedef {Object} TwitchChannelData
   * @property {Collection<string,TwitchChannel>} channels the fetched channels
   * @property {?string} cursor the pagination cursor to get more channels
   */

  /**
   * Obtains the list of categories matching the search query partially or entirely from Twitch
   * @param {string} query the search query
   * @param {boolean} [options.live] whether to only search live channels
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchChannel|TwitchChannelData>}
   */
  async search(query, { live, after, resultCount, cache = true } = {}) {
    const params = new URLSearchParams();
    params.append('query', query);
    if (live !== undefined) params.append('live_only', live);
    if (after !== undefined) params.append('after', after);
    if (resultCount !== undefined) params.append('first', resultCount);

    const res = await this.socket.rest.get('/search/channels', { query: params });
    return _getResReturn(res, cache, this, 'channels');
  }

  /**
   * Language codes that can be used on twitch, one of:
   * * An ISO 639-1 two letter code
   * * `other`
   * @typedef {string} TwitchLanguageCode
   *
   */

  /**
   * Data used to edit a twitch channel
   * @typedef {Object} TwitchChannelEditData
   * @property {TwitchCategoryResolvable|'0'|''} [category] the new category to set
   * @property {TwitchLanguageCode} [language] the new language to set
   * @property {string} [title] the new title to set
   * @property {number} [delay] the new stream delay in seconds (partners)
   */

  /**
   * Updates the properties of a channel
   * @param {TwitchChannelResolvable} channel the channel to edit
   * @param {TwitchChannelEditData} data the data to edit with
   * @returns {Promise<TwitchChannel>}
   */
  async edit(channel, data) {
    const _data = { ...data };
    const id = this.resolveId(channel);
    if (!id) throw new Error(`Invalid channel id resolvable was provided: ${channel}`);

    const params = new URLSearchParams();
    params.append('broadcaster_id', id);

    if ('category' in data) {
      const categoryId = this.socket.categories.resolveId(data.category);
      _data.game_id = categoryId;
      delete _data.category;
    }

    if ('language' in data) {
      _data.broadcaster_language = data.language;
      delete _data.language;
    }

    await this.socket.rest.patch('/users', { query: params, body: data, authId: id, allowApp: false });

    return this._add({ broadcaster_id: id, ..._data });
  }

  /**
   * Resolves a {@link TwitchChannelResolvable} to a {@link TwitchChannel} object
   * @param {TwitchChannelResolvable} channel The TwitchChannelResolvable to identify
   * @returns {?TwitchChannel}
   */
  resolve(channel) {
    if (channel instanceof TwitchUser || channel instanceof TwitchStream) return channel.channel;
    return super.resolve(channel);
  }

  /**
   * Resolves a {@link TwitchChannelResolvable} to a {@link TwitchChannel} id
   * @param {TwitchChannelResolvable} channel The TwitchChannelResolvable to identify
   * @returns {?string}
   */
  resolveId(channel) {
    if (channel instanceof TwitchUser || channel instanceof TwitchStream) return channel.id;
    return super.resolveId(channel);
  }
}

module.exports = TwitchChannelManager;
