'use strict';

const { Collection } = require('@discordjs/collection');
const Base = require('./Base');

/**
 * Represents a team on Twitch.
 * @extends {TwitchBase}
 */
class TwitchTeam extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The teams's id
     * @type {string}
     */
    this.id = data.id;

    this._patch(data);
  }

  _patch(data) {
    if ('team_name' in data) {
      /**
       * The name of the team
       * @type {?string}
       */
      this.name = data.team_name;
    } else {
      this.name ??= null;
    }

    if ('team_display_name' in data) {
      /**
       * The display name of the team
       * @type {?string}
       */
      this.displayName = data.team_display_name;
    } else {
      this.displayName ??= null;
    }

    if ('info' in data) {
      /**
       * The description of the team
       * @type {?string}
       */
      this.info = data.info;
    } else {
      this.info ??= null;
    }

    if ('created_at' in data) {
      /**
       * The timestamp the team was created at
       * @type {?number}
       */
      this.createdTimestamp = Date.parse(data.created_at);
    } else {
      this.createdTimestamp ??= null;
    }

    if ('updated_at' in data) {
      /**
       * The timestamp the team was last updated at
       * @type {?number}
       */
      this.updatedTimestamp = Date.parse(data.updated_at);
    } else {
      this.updatedTimestamp ??= null;
    }

    if ('background_image_url' in data) {
      /**
       * The template URL for the teams background image
       * @type {?string}
       */
      this.backgroundImageURL = data.background_image_url;
    } else {
      this.backgroundImageURL ??= null;
    }

    if ('banner' in data) {
      /**
       * The template URL for the teams banner image
       * @type {?string}
       */
      this.bannerURL = data.banner;
    } else {
      this.bannerURL ??= null;
    }

    if ('thubmnail_url' in data) {
      /**
       * The template URL for the teams logo
       * @type {?string}
       */
      this.thumbnailURL = data.thumbnail_url;
    } else {
      this.thumbnailURL ??= null;
    }

    if ('users' in data) {
      /**
       * The ids of the users that are a part of this team (may be incomplete when fetched from a channels perspective)
       * @type {string[]}
       * @private
       */
      this._userIds = data.users.map(user => user.user_id);

      for (const user of data.users) {
        this.client.users._add(user);
      }
    } else {
      this._userIds ??= [];
    }

    if ('broadcaster_id' in data) {
      if (Array.isArray(this._userIds) && !this._userIds.includes(data.broadcaster_id)) {
        this._userIds.push(data.broadcaster_id);
      }

      if ('broadcaster_name' in data && 'broadcaster_login' in data) {
        this.client.users._add({
          id: data.broadcaster_id,
          login: data.broadcaster_login,
          display_name: data.broadcaster_name,
        });
      }
    }
  }

  /**
   * The time the team was created at
   * @type {?Date}
   * @readonly
   */
  get createdAt() {
    return this.createdTimestamp ? new Date(this.createdTimestamp) : null;
  }

  /**
   * The time the team was last updated at
   * @type {?Date}
   * @readonly
   */
  get updatedAt() {
    return this.updatedTimestamp ? new Date(this.updatedTimestamp) : null;
  }

  /**
   * The users that are a part of this team, the value for a team member will be null if their user is not cached.
   * <info> This can be  incomplete if the team was initially fetched from {@link TwitchTeamManager#fetchChannelTeams}</info>
   * @type {Collection<string,TwitchUser|null>}
   * @readonly
   */
  get users() {
    const users = new Collection();
    for (const id of this._userIds) {
      const user = this.client.users.resolve(id);
      users.set(id, user);
    }
    return users;
  }

  /**
   * Fetches this team
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchChannel>}
   */
  fetch(force = true) {
    return this.client.teams.fetch({ team: this.id, force });
  }
}

module.exports = TwitchTeam;
