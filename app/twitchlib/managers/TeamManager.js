'use strict';

const CachedManager = require('./CachedManager');
const Team = require('../structures/Team');
const { _getResReturn } = require('../util/Util');

/**
 * Manages API methods for teams and stores their cache
 * @extends {TwitchCachedManager}
 */
class TwitchTeamManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Team, iterable);
  }

  /**
   * The cache of this manager
   * @type {Collection<string,TwitchTeam>}
   * @name TwitchTeamManager#cache
   */

  /**
   * Data that resolves to give a TwitchTeam object. This can be:
   * * A TwitchTeam object
   * * An id (string)
   * @typedef {TwitchTag|string} TwitchTeamResolvable
   */

  /**
   * Obtains a team from Twitch, or the cache if they're already available
   * @param {TwitchTeamResolvable} [options.team] team to fetch
   * @param {string} [options.name] the name of a team to fetch
   * @param {boolean} [options.force=false] whether to skip the cache check and request the API
   * @param {boolean} [options.cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<TwitchTeam>}
   */
  async fetch({ team, name, force = false, cache = true } = {}) {
    if (team && name) throw new RangeError('Only one of team or name can be specified');
    if (!team && !name) throw new RangeError('One of team or name must be specified');
    if (!force) {
      if (team) {
        const cached = this.resolve(team);
        if (cached) return cached;
      } else {
        const cached = this.cache.find(t => t.name === name);
        if (cached) return cached;
      }
    }

    const params = new URLSearchParams();
    if (team) {
      const id = this.resolveId(team);
      if (!id) throw new TypeError(`Invalid id resolvable was provided: ${team}`);
      params.append('id', id);
    }
    if (name !== undefined) params.append('name', name);

    const res = await this.client.rest.get('/teams', { query: params });

    return this._add(res.data[0], cache);
  }

  /**
   * Fetch teams that a channel belongs to
   * @param {TwitchChannelResolvable} channel the channel to fetch teams for
   * @param {boolean} [cache=true] whether to cache the fetched data if it wasn't already
   * @returns {Promise<?TwitchTeam|Collection<string,TwitchTeam>>}
   */
  async fetchChannelTeams(channel, cache = true) {
    const id = this.client.channels.resolveId(channel);
    if (!id) throw new TypeError(`Invalid channel id resolvable was provided: ${channel}`);

    const params = new URLSearchParams();
    params.append('broadcaster_id', id);

    const res = await this.client.rest.get('/teams/channel', { query: params, authId: id });

    return _getResReturn(res, cache, this);
  }
}

module.exports = TwitchTeamManager;
