'use strict';

/**
 * Manages the API methods of a data model.
 * @abstract
 */
class TwitchBaseManager {
  constructor(socket) {
    /**
     * The app that instantiated this Manager
     * @name TwitchBaseManager#app
     * @type {Application}
     * @readonly
     */
    Object.defineProperty(this, 'app', { value: socket.app });

    /**
     * The twitch manager that instantiated this Manager
     * @name TwitchBaseManager#socket
     * @type {TwitchManager}
     * @readonly
     */
    Object.defineProperty(this, 'socket', { value: socket });
  }
}

module.exports = TwitchBaseManager;
