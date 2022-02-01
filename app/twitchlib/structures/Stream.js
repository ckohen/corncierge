'use strict';

const Base = require('./Base');
const StreamTagManager = require('../managers/StreamTagManager');

/**
 * Represents a channel's stream on Twitch.
 * @extends {TwitchBase}
 */
class TwitchStream extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The id of the user / channel this stream is on
     * @type {string}
     * @private
     */
    this.id = data.user_id ?? data.broadcaster_user_id;

    this._patch(data);
  }

  _patch(data) {
    if ('started_at' in data) {
      /**
       * The timestamp the stream was started at
       * @type {?number}
       */
      this.startedTimestamp = data.started_at === '' ? null : Date.parse(data.started_at);
    } else {
      this.startedTimestamp ??= null;
    }

    if ('id' in data) {
      /**
       * The streams's id (separate from channel / user id)
       * @type {?string}
       */
      this.streamId = data.id;
    } else {
      this.streamId ??= null;
    }

    if ('type' in data) {
      /**
       * The stream type, one of:
       * * `live`
       * * an empty string (during errors)
       * @type {?string}
       */
      this.type = data.type;
    } else {
      this.type ??= null;
    }

    if ('viewer_count' in data) {
      /**
       * The number of viewers watching this stream the last time this stream was fetched.
       * <warn>This is not updated regularly and is only provided to prevent calling the API twice
       * when fetching for more than the viewer count</warn>
       * @type {?number}
       */
      this.viewerCount = data.viewer_count;
    } else {
      this.viewerCount ??= null;
    }

    if ('thumbnail_url' in data) {
      /**
       * A template URL for the thumbnail image of the stream, parameters are {width} and {height}
       * @type {?string}
       */
      this.thumbnailURL = data.thumbnail_url;
    } else {
      this.thumbnailURL ??= null;
    }

    if ('tag_ids' in data) {
      /**
       * The list of tag ids currently applying to this stream
       * @type {?string[]}
       * @private
       */
      this._tags = data.tag_ids;
    } else {
      this._tags ??= null;
    }

    const addedChannel = {
      broadcaster_id: data.user_id ?? data.broadcaster_user_id,
      broadcaster_login: data.user_login ?? data.broadcaster_user_login,
      broadcaster_name: data.user_name ?? data.broadcaster_user_name,
    };

    if ('game_id' in data) {
      addedChannel.game_id = data.game_id;
    }

    if ('game_name' in data) {
      addedChannel.game_name = data.game_name;
    }

    if ('title' in data) {
      addedChannel.title = data.title;
    }

    if ('language' in data) {
      addedChannel.broadcaster_language = data.language;
    }

    if ('is_mature' in data) {
      addedChannel.is_mature = data.is_mature;
    }

    if (addedChannel.broadcaster_login !== undefined && addedChannel.broadcaster_name !== undefined) {
      this.client.channels._add(addedChannel);
    }
  }

  /**
   * The channel this stream is occuring on
   * @type {?TwitchChannel}
   * @readonly
   */
  get channel() {
    return this.client.channels.resolve(this.id);
  }

  /**
   * The user that is streaming
   * @type {?TwitchUser}
   * @readonly
   */
  get user() {
    return this.client.users.resolve(this.id);
  }

  /**
   * The time the stream was started at
   * @type {?Date}
   * @readonly
   */
  get startedAt() {
    return this.startedTimestamp ? new Date(this.startedTimestamp) : null;
  }

  /**
   * The amount of time the stream has been ongoing
   * @type {?number}
   * @readonly
   */
  get uptime() {
    return this.startedTimestamp ? Date.now() - this.startedTimestamp : null;
  }

  /**
   * A manager for the tags belonging to this stream
   * @type {TwitchStreamTagManager}
   * @readonly
   */
  get tags() {
    return new StreamTagManager(this);
  }

  /**
   * Start a commercial for this streams viewers
   * @param {CommercialLength} length the length of the commercial
   * @returns {Promise<CommercialReturnData>}
   */
  startCommercial(length) {
    return this.client.streams.startCommercial(this.id, length);
  }

  /**
   * Fetches this stream
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchStream>}
   */
  fetch(force = true) {
    return this.client.streams.fetch({ userIds: [this.id], force });
  }

  /**
   * Fetches the viewer count for this stream
   * @returns {Promise<number>}
   */
  async fetchViewers() {
    const data = await this.fetch();
    return data.viewerCount;
  }
}

module.exports = TwitchStream;
