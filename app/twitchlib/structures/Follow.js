'use strict';

class Follow {
  constructor(client, data) {
    /**
     * The twitch client that instantiated this
     * @type {TwitchClient}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The id of the user this follow is from
     * @type {string}
     * @private
     */
    this._fromId = data.from_id ?? data.user_id;

    /**
     * The id of the user this follow is to
     * @type {string}
     * @private
     */
    this._toId = data.to_id ?? data.broadcaster_user_id;

    /**
     * The timestamp the follow was created at
     * @type {number}
     */
    this.createdTimestamp = Date.parse(data.followed_at);

    this.client.users._add({
      id: data.from_id ?? data.user_id,
      login: data.from_login ?? data.user_login,
      display_name: data.from_name ?? data.user_name,
    });

    const addedBroadcaster = {
      id: data.to_id ?? data.broadcaster_user_id,
      display_nam: data.to_name ?? data.broadcaster_user_name,
    };

    if ('broadcaster_user_login' in data) {
      addedBroadcaster.login = data.broadcaster_user_login;
    }
    this.client.users._add(addedBroadcaster);
  }

  /**
   * The user this follow is from
   * @type {?TwitchUser}
   * @readonly
   */
  get from() {
    return this.client.users.resolve(this._fromId);
  }

  /**
   * The user this follow is to
   * @type {?TwitchUser}
   * @readonly
   */
  get to() {
    return this.client.users.resolve(this._toId);
  }

  /**
   * The time the follow was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
}

module.exports = Follow;
