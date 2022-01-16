'use strict';

const Base = require('./Base');

class TwitchUser extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The user's id
     * @type {string}
     */
    this.id = data.id ?? data.user_id;

    /**
     * The timestamp the user was created at
     * @type {number}
     */
    this.createdTimestamp = Date.parse(data.created_at);

    this._patch(data);
  }

  _patch(data) {
    if ('login' in data || 'user_login' in data) {
      /**
       * The user's login name
       * @type {?string}
       */
      this.login = data.login ?? data.user_login;
    } else {
      this.login ??= null;
    }

    if ('display_name' in data || 'user_name' in data) {
      /**
       * The user's name as it appears in chat
       * @type {?string}
       */
      this.displayName = data.display_name ?? data.user_name;
    } else {
      this.displayName ??= null;
    }

    if ('type' in data) {
      /**
       * The type of user, one of:
       * * `staff`
       * * `admin`
       * * `global_mod`
       * * An empty string
       * @type {?string}
       */
      this.type = data.type;
    } else {
      this.type ??= null;
    }

    if ('broadcaster_type' in data) {
      /**
       * The user's broadcaster type, one of:
       * * `partner`
       * * `affiliate`
       * * An empty strin
       * @type {?string}
       */
      this.broadcasterType = data.broadcaster_type;
    } else {
      this.broadcasterType ??= null;
    }

    if ('description' in data) {
      /**
       * The user's channel descriptionm
       * @type {?string}
       */
      this.description = data.description;
    } else {
      this.description ??= null;
    }

    if ('profile_image_url' in data) {
      /**
       * The URL of the user's profile image
       * @type {?string}
       */
      this.profileImageURL = data.profile_image_url;
    } else {
      this.profileImageURL ??= null;
    }

    if ('offline_image_url' in data) {
      /**
       * The URL of the user's offline image
       * @type {string}
       */
      this.offlineImageURL = data.offline_image_url;
    } else {
      this.offlineImageURL ??= null;
    }

    if ('view_count' in data) {
      /**
       * The total number of views of this user.
       * <warn>This is not updated regularly and is only provided to prevent calling the API twice
       * when fetching for more than the view count</warn>
       * @type {?number}
       */
      this.viewCount = data.viewCount;
    } else {
      this.viewCount ??= null;
    }

    if ('email' in data) {
      /**
       * The user's verified email address, if adequate access is granted
       * @type {string}
       */
      this.email = data.email;
    } else {
      this.email ??= null;
    }
  }

  /**
   * The time the user was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The channel associated with this user
   * @type {?TwitchChannel}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.id);
  }

  /**
   * Fetch the follow data for the specified user, if following this user
   * @param {TwitchUserResolvable} user the user to get follow data for
   * @returns {Promise<?TwitchFollow>}
   */
  fetchFollower(user) {
    return this.client.users.fetchFollows({ streamer: this.id, user });
  }

  /**
   * Fetch the follow data for the users following this user
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @returns {Promise<UserFollowData>}
   */
  fetchFollowers({ resultCount, after }) {
    return this.client.users.fetchFollows({ streamer: this.id, resultCount, after });
  }

  /**
   * Fetch the follow data for the users this user is following
   * @param {number} [options.resultCount] the number of results to return, up to 100
   * @param {string} [options.after] the value of the cursor used for pagination to get the next page
   * @returns {Promise<UserFollowData>}
   */
  fetchFollowing({ resultCount, after }) {
    return this.client.users.fetchFollows({ user: this.id, resultCount, after });
  }

  /**
   * Checks if this users is subscribed to a streamer, rejects if not, and returns the subscription data if so
   * @param {TwitchUserResolvable} streamer the streamer to check if this user is following
   * @returns {Promise<TwitchSubscription>}
   */
  fetchSubscription(streamer) {
    return this.client.users.fetchSubscription(this.id, streamer);
  }

  /**
   * Fetches the view count for this user
   * @returns {Promise<number>}
   */
  async fetchViewCount() {
    const data = await this.fetch();
    return data.viewCount;
  }

  /**
   * Updates the description on this user
   * @param {string} description The new account description
   * @returns {Promise<TwitchUser>}
   */
  edit(description) {
    return this.client.users.edit(this.id, description);
  }

  /**
   * Fetches this user
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchUser>}
   */
  fetch(force = true) {
    return this.client.users.fetch({ ids: [this.id], force });
  }
}

module.exports = TwitchUser;
