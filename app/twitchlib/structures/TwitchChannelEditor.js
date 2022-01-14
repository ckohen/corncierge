'use strict';

const TwitchBase = require('./TwitchBase');

class TwitchChannelEditor extends TwitchBase {
  constructor(socket, data) {
    super(socket);

    /**
     * The editor's id
     * @type {string}
     */
    this.id = data.user_id;

    /**
     * The timestamp the user was created at
     * @type {number}
     */
    this.createdTimestamp = new Date(data.created_at).getTime();

    this.socket.users._add({
      id: data.user_id,
      user_name: data.user_name,
    });
  }

  /**
   * The user that has this permission
   * @type {TwitchUser}
   * @readonly
   */
  get user() {
    return this.socket.users.resolve(this.id);
  }

  /**
   * The time the user was granted editor permissions
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }
}

module.exports = TwitchChannelEditor;
