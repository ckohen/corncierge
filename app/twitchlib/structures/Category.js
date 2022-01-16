'use strict';

const Base = require('./Base');

class TwitchCategory extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The category's id
     * @type {string}
     */
    this.id = data.id;

    this._patch(data);
  }

  _patch(data) {
    if ('name' in data) {
      /**
       * The name of the category
       * @type {?string}
       */
      this.name = data.name;
    } else {
      this.name ??= null;
    }

    if ('box_art_url' in data) {
      /**
       * The url for this categories box art image
       * @type {?string}
       */
      this.boxArtURL = data.box_art_url;
    } else {
      this.boxArtURL ??= null;
    }
  }

  /**
   * Fetches this category
   * @param {boolean} [force=true] Whether to skip the cache check and request the API
   * @returns {Promise<TwitchChannel>}
   */
  fetch(force = true) {
    return this.client.categories.fetch({ ids: [this.id], force });
  }
}

module.exports = TwitchCategory;
