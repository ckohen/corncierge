'use strict';

const Base = require('./Base');

/**
 * Represents a channel on Twitch.
 * @extends {TwitchBase}
 */
class TwitchChannel extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The channel's id
     * @type {string}
     */
    this.id = data.id ?? data.broadcaster_id ?? data.broadcaster_user_id;

    this._patch(data);
  }

  _patch(data) {
    if ('broadcaster_language' in data) {
      /**
       * The channels language, one of:
       * * An ISO 639-1 two letter code
       * * `other`
       * @type {?TwitchLanguageCode}
       */
      this.language = data.broadcaster_language;
    } else {
      this.language ??= null;
    }

    if ('title' in data) {
      /**
       * The channel's stream title
       * @type {?string}
       */
      this.title = data.title;
    } else {
      this.title ??= null;
    }

    if ('delay' in data) {
      /**
       * The delay set for this channels streams
       * @type {?number}
       */
      this.streamDelay = data.delay;
    } else {
      this.streamDelay ??= null;
    }

    if ('is_mature' in data) {
      /**
       * Whether the channels streams are considered mature
       * @type {?boolean}
       */
      this.mature = data.is_mature;
    } else {
      this.mature ??= null;
    }

    if (
      ('broadcaster_login' in data || 'broadcaster_user_login' in data) &&
      ('broadcaster_name' in data || 'broadcaster_user_name' in data || 'display_name' in data)
    ) {
      this.client.users._add({
        id: this.id,
        login: data.broadcaster_login ?? data.broadcaster_user_login,
        display_name: data.broadcaster_name ?? data.broadcaster_user_name ?? data.display_name,
      });
    }

    if (('game_id' in data || 'category_id' in data) && ('game_name' in data || 'category_name' in data)) {
      this.client.categories._add({
        id: data.game_id ?? data.category_id,
        name: data.game_name ?? data.category_name,
      });
    }

    if ('game_id' in data || 'category_id' in data) {
      /**
       * The id of the category the channel is set to
       * @type {?string}
       * @private
       */
      this._categoryId = data.game_id ?? data.category_id;
    } else {
      this._categoryId ??= null;
    }

    if ('is_live' in data && data.is_live === true) {
      this.client.streams._add({
        user_id: data.id,
        type: 'live',
        started_at: data.started_at,
        thumbnail_url: data.thumbnail_url,
        tags_ids: data.tags_ids,
      });
    }
  }

  /**
   * The login name of the user assciated with this channel
   * @type {?string}
   * @readonly
   */
  get name() {
    return this.user?.login ?? null;
  }

  /**
   * The user associated with this channel
   * @type {?TwitchUser}
   * @readonly
   */
  get user() {
    return this.client.users.resolve(this.id);
  }

  /**
   * The category the channel is set to stream in
   * @type {?TwitchCategory}
   * @readonly
   */
  get category() {
    return this.client.categories.resolve(this._categoryId);
  }

  /**
   * The stream that may be occuring on this channel
   * @type {?TwitchStream}
   * @readonly
   */
  get stream() {
    return this.client.streams.resolve(this.id);
  }

  /**
   * Edits this channel
   * @param {TwitchChannelEditData} data The data to edit the channel with
   * @returns {Promise<TwitchChannel>}
   */
  edit(data) {
    return this.client.channels.edit(this.id, data);
  }

  /**
   * Changes the category of this channel
   * @param {TwitchCategoryResolvable|'0'} category the new category
   * @returns {Promise<TwitchChannel>}
   */
  setCategory(category) {
    return this.edit({ category });
  }

  /**
   * Changes the language of this channel
   * @param {TwitchLanguageCode} language the new language
   * @returns {Promise<TwitchChannel>}
   */
  setLanguage(language) {
    return this.edit({ language });
  }

  /**
   * Changes the title of this channel
   * @param {string} title the new title
   * @returns {Promise<TwitchChannel>}
   */
  setTitle(title) {
    return this.edit({ title });
  }

  /**
   * Changes the stream delay for streams on this channel
   * <warn>Restricted to partners</warn>
   * @param {number} delay the new stream delay
   * @returns {Promise<TwitchChannel>}
   */
  setDelay(delay) {
    return this.edit({ delay });
  }

  /**
   * Fetches this channel
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchChannel>}
   */
  fetch(force = true) {
    return this.client.channels.fetch(this.id, { force });
  }

  /**
   * Fetches subscription data for subscribers to this channel
   * @param {FetchSubscriptionsOptions} [options] options for the fetch
   * @returns {Promise<ChannelSubscriptionData>}
   */
  fetchSubscriptions({ users, resultCount, after }) {
    return this.client.channels.fetchSubscriptions(this.id, { users, resultCount, after });
  }

  /**
   * Fetches the list of users that have editor permissions for this channel
   * @returns {Promise<TwitchChannelEditor[]>}
   */
  fetchEditors() {
    return this.client.channels.fetchEditors(this.id);
  }

  /**
   * Fetches the teams this channel is a part of
   * @param {boolean} [cache=true] Whether to skip the cache check and request the API
   * @returns {Promise<Collection<string,TwitchTeam>>}
   */
  fetchTeams(cache = true) {
    return this.client.teams.fetchChannelTeams(this.id, cache);
  }
}

module.exports = TwitchChannel;
