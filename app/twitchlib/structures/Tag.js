'use strict';

const Base = require('./Base');

class TwitchTag extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The tag's id
     * @type {string}
     */
    this.id = data.tag_id;

    this._patch(data);
  }

  _patch(data) {
    if ('localization_names' in data) {
      /**
       * The map of localized names for this tag
       * @type {Map<string, string>}
       */
      this.names = new Map(Object.entries(data.localization_names));
    } else {
      this.names ??= null;
    }

    if ('localization_descriptions' in data) {
      /**
       * The map of localized descriptions for this tag
       * @type {Map<string, string>}
       */
      this.descriptions = new Map(Object.entries(data.localization_descriptions));
    } else {
      this.descriptions ??= null;
    }

    if ('is_auto' in data) {
      /**
       * Whether this tag is automatically assigned
       * @type {?boolean}
       */
      this.auto = data.is_auto;
    } else {
      this.auto ??= null;
    }
  }

  /**
   * The english name for this tag
   * @type {?string}
   * @readonly
   */
  get name() {
    return this.names?.['en-us'] ?? null;
  }

  /**
   * The english description for this tag
   * @type {?string}
   * @readonly
   */
  get description() {
    return this.descriptions?.['en-us'] ?? null;
  }

  /**
   * Fetches this tag
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchTag>}
   */
  fetch(force = true) {
    return this.client.tags.fetch({ tags: [this.id], force });
  }
}

module.exports = TwitchTag;
