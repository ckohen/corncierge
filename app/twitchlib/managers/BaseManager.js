'use strict';

/**
 * Manages the API methods of a data model.
 * @abstract
 */
class TwitchBaseManager {
  constructor(client) {
    /**
     * The twitch client that instantiated this Manager
     * @name TwitchBaseManager#client
     * @type {TwitchClient}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }
}

module.exports = TwitchBaseManager;
