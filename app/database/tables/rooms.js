'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the rooms database table
 * @extends {BaseTable}
 */
class roomsTable extends BaseTable {
  /**
   * Get rooms.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildRoomID as guildRoomId, data FROM `rooms`').then(this.parseJSON.bind(null, ['data']));
  }

  /**
   * Add a room to the room manager
   * @param {string} id the room id (guildId-room) to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `rooms` (guildRoomID, data) VALUES (?, '{}')", [id]);
  }

  /**
   * Remove a room from the room manager
   * @param {string} id the room id (guildId-room) to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `rooms` WHERE `guildRoomID` = ?', [id]);
  }

  /**
   * The data for any room:
   * @typedef {Object} RoomData
   * @param {string} id the id of the room
   * @param {string} name the display name of the room
   * @param {string} owner the snowflake of the room owner
   * @param {number} playerCount the max number of players allowed
   * @param {string} code the current code for the room
   * @param {string[]} players an array of snowflakes for current players
   * @param {string[]} waiting an array of snowflakes for people in the waiting room
   * @param {string} lastChannelId the snowflake for the channel the last message of this room was sent in
   * @param {string} lastMessageId the snowflake for the last message this room was sent as
   */

  /**
   * Edit a room
   * @param {string} id the room id (guildId-room) to edit in the database
   * @param {RoomData} data the updated data for the room
   * @returns {Promise<void>}
   */
  edit(id, data) {
    return this.socket.query('UPDATE `rooms` SET `data` = ? WHERE `guildRoomID` = ?', [JSON.stringify(data), id]);
  }
}

module.exports = roomsTable;
