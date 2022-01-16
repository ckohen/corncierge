'use strict';

/**
 * Represents a subscription to a channel on Twitch.
 */
class TwitchSubscription {
  constructor(client, data) {
    /**
     * The twitch client that instantiated this
     * @type {TwitchClient}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * Whether this subscription was gifted
     * @type {boolean}
     */
    this.gifted = data.is_gift;

    /**
     * The id of the user this subscription is for
     * @type {string}
     * @private
     */
    this._fromId = data.user_id;

    /**
     * The id of the user this subscription is to
     * @type {string}
     * @private
     */
    this._toId = data.broadcaster_id ?? data.broadcaster_user_id;

    /**
     * The id of the user that gifted this subscription
     * @type {string}
     * @private
     */
    this._gifterId = data.gifter_id ?? null;

    /**
     * The string tier type
     * @type {string}
     * @private
     */
    this._tier = data.tier;

    /**
     * The name of the subscription plan
     * <info>This is only present when the subscription was fetched using the broadcasters oauth token</info>
     * @type {?string}
     */
    this.planName = data.plan_name ?? null;

    this.client.users._add({
      id: data.broadcaster_id ?? data.broadcaster_user_id,
      login: data.broadcaster_login ?? data.broadcaster_user_login,
      display_name: data.broacaster_name ?? data.broadcaster_user_name,
    });

    if ('user_name' in data && 'user_login' in data) {
      this.client.users._add({
        id: data.user_id,
        login: data.user_login,
        display_name: data.user_name,
      });
    }

    if ('gifter_id' in data && 'gifter_login' in data && 'gifter_name' in data) {
      this.client.users._add({
        id: data.gifter_id,
        login: data.gifter_login,
        display_name: data.gifter_name,
      });
    }
  }

  /**
   * The user this subscription is for
   * @type {?TwitchUser}
   * @readonly
   */
  get from() {
    return this.client.users.resolve(this._fromId);
  }

  /**
   * The user this subscription is to
   * @type {?TwitchUser}
   * @readonly
   */
  get to() {
    return this.client.users.resolve(this._toId);
  }

  /**
   * The user that gifted this subscription
   * <info>This is only present when the subscription was fetched using the broadcasters oauth token</info>
   * @type {?TwitchUser}
   * @readonly
   */
  get gifter() {
    return this._gifterId ? this.client.users.resolve(this._gifterId) : null;
  }

  /**
   * The tier of this subscription
   * @type {number}
   * @readonly
   */
  get tier() {
    return Number(this._tier[0]);
  }
}

module.exports = TwitchSubscription;
