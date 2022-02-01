'use strict';

const { Collection } = require('@discordjs/collection');
const CachedManager = require('./CachedManager');
const Channel = require('../structures/Channel');
const Follow = require('../structures/Follow');
const Stream = require('../structures/Stream');
const Subscription = require('../structures/Subscription');
const User = require('../structures/User');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for users and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchUserManager extends CachedManager {
  constructor(client, iterable) {
    super(client, User, iterable);
  }

  _add(data, cache) {
    return super._add(data, cache, { id: data.id ?? data.user_id });
  }

  /**
   * The cache of this manager
   * @type {Collection<string, TwitchUser>}
   * @name TwitchUserManager#cache
   */

  /**
   * Data that resolves to give a TwitchUser object. This can be:
   * * A TwitchUser object
   * * An id (string)
   * * A TwitchChannel object
   * * A TwitchStream object
   * @typedef {TwitchUser|string|TwitchChannel|TwitchStream} TwitchUserResolvable
   */

  /**
   * Data returned from the API for mass follow data
   * @typedef {Object} UserFollowData
   * @property {number} total the total number of follows for this user or streamer
   * @property {TwitchFollow[]} follows the array of actual follows
   * @property {?string} cursor the pagination cursor to get more follow data
   */

  /**
   * Fetch the follow data for the specified combination of streamer and / or user
   * @param {TwitchUserResolvable} [options.streamer] the streamer to get follow data for
   * @param {TwitchUserResolvable} [options.user] the user to get follow data for
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @returns {Promise<?TwitchFollow|UserFollowData>}
   */
  async fetchFollows({ streamer, user, resultCount, after } = {}) {
    const params = new URLSearchParams();
    const fromId = this.resolveId(user);
    if (user && !fromId) throw new Error(`Invalid user id resolvable was provided: ${user}`);
    const toId = this.resolveId(streamer);
    if (streamer && !toId) throw new Error(`Invalid streamer id resolvable was provided: ${streamer}`);
    if (after !== undefined) params.append('after', after);
    if (resultCount !== undefined) params.append('first', resultCount);
    if (fromId) params.append('from_id', fromId);
    if (toId) params.append('to_id', toId);

    const res = await this.client.rest.get('/users/follows', { query: params });

    if (res.total === 0) return null;
    if (res.total === 1) return new Follow(this.client, res.data[0]);

    const follows = [];
    for (const rawFollow of res.data) {
      const follow = new Follow(this.client, rawFollow);
      follows.push(follow);
    }
    return { total: res.total, follows, cursor: res.pagination?.cursor ?? null };
  }

  /**
   * Fetch data for a subscription from a user to a streamer
   * @param {TwitchUserResolvable} user the user to get subscription data for
   * @param {TwitchUserResolvable} streamer the streamer to get subscritpion data for
   * @returns {Promise<TwitchSubscription>}
   */
  async fetchSubscription(user, streamer) {
    const params = new URLSearchParams();
    const userId = this.resolveId(user);
    if (!userId) throw new Error(`Invalid user id resolvable was provided: ${user}`);
    const streamerId = this.resolveId(streamer);
    if (!streamerId) throw new Error(`Invalid streamer id resolvable was provided: ${streamer}`);
    params.append('user_id', userId);
    params.append('broadcaster_id', streamerId);

    const res = await this.client.rest.get('/subscriptions/user', { query: params, authId: userId });

    return new Subscription(this.client, { ...res.data[0], user_id: userId });
  }

  /**
   * Obtains one or multiple users from Twitch, or the cache if they're already available
   * @param {TwitchUserResolvable[]} [options.ids] users to fetch
   * @param {string[]} [options.logins] login names for user to fetch
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchUser|Collection<string,TwitchUser>>}
   */
  async fetch({ ids = [], logins = [], force = false, cache = true } = {}) {
    if (!force) {
      const cachedUsers = new Collection();
      let shouldFetch = false;
      if (ids.length === 0 && logins.length === 0) shouldFetch = true;
      if (!shouldFetch) {
        for (const id of ids) {
          const user = this.resolve(id);
          if (!user) {
            shouldFetch = true;
            break;
          }
          cachedUsers.set(user.id, user);
        }
      }
      if (!shouldFetch) {
        for (const login of logins) {
          const user = this.cache.find(u => u.login === login.toLowerCase());
          if (!user) {
            shouldFetch = true;
            break;
          }
          cachedUsers.set(user.id, user);
        }
      }
      if (!shouldFetch) {
        if (cachedUsers.size === 1) return cachedUsers.first();
        return cachedUsers;
      }
    }

    const params = new URLSearchParams();
    for (const idResolvable of ids) {
      const id = this.resolveId(idResolvable);
      if (!id) throw new TypeError(`Invalid id resolvable was provided: ${idResolvable}`);
      params.append('id', id);
    }
    for (const login of logins) {
      params.append('login', login);
    }

    let authId;
    if (ids.length === 1 && logins.length === 0) authId = this.resolveId(ids[0]);
    const res = await this.client.rest.get('/users', { query: params, authId });

    return _getResReturn(res, cache, this);
  }

  /**
   * Updates the properties of a user
   * @param {TwitchUserResolvable} user the user to edit
   * @param {string} description the new description
   * @returns {Promise<TwitchUser>}
   */
  async edit(user, description) {
    const userId = this.resolveId(user);
    if (!userId) throw new Error(`Invalid user id resolvable was provided: ${user}`);

    const params = new URLSearchParams();
    if (description) params.append('description', description);

    const res = await this.client.rest.put('/users', { query: params, authId: userId, allowApp: false });

    return this._add(res.data[0]);
  }

  /**
   * Resolves a {@link TwitchUserResolvable} to a {@link TwitchUser} object
   * @param {TwitchUserResolvable} user The TwitchUserResolvable to identify
   * @returns {?TwitchUser}
   */
  resolve(user) {
    if (user instanceof Channel || user instanceof Stream) return super.resolve(user.id);
    return super.resolve(user);
  }

  /**
   * Resolves a {@link TwitchUserResolvable} to a {@link TwitchUser} id
   * @param {TwitchUserResolvable} user The TwitchUserResolvable to identify
   * @returns {?string}
   */
  resolveId(user) {
    if (user instanceof Channel || user instanceof Stream) return user.id;
    return super.resolveId(user);
  }
}

module.exports = TwitchUserManager;
