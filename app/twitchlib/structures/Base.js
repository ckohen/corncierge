'use strict';

const Util = require('../util/Util');

/**
 * Represents a data model that is identifiable by an id from twitch.
 * @abstract
 */
class TwitchBase {
  constructor(client) {
    /**
     * The twitch client that instantiated this
     * @name TwitchBase#client
     * @type {TwitchClient}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data) {
    return data;
  }

  _update(data) {
    const clone = this._clone();
    this._patch(data);
    return clone;
  }

  toJSON(...props) {
    return Util.flatten(this, ...props);
  }

  valueOf() {
    return this.id;
  }
}

module.exports = TwitchBase;
