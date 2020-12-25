'use strict';

module.exports = {
  /**
   * Get rooms.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildRoomID, data FROM `rooms`').then(all => {
      all.forEach(row => {
        row.data = JSON.parse(row.data);
      });
      return all;
    });
  },

  /**
   * Add a room to the room manager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the room id (guildID-room) to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `rooms` (guildRoomID, data) VALUES (?, '{}')", [id]);
  },

  /**
   * Remove a room from the room manager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the room id (guildID-room) to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `rooms` WHERE `guildRoomID` = ?', [id]);
  },

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
   * @param {string} lastChannelID the snowflake for the channel the last message of this room was sent in
   * @param {string} lastMessageID the snowflake for the last message this room was sent as
   */

  /**
   * Edit a room
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the room id (guildID-room) to edit in the database
   * @param {RoomData} data the updated data for the room
   * @returns {Promise<void>}
   */
  edit(socket, id, data) {
    return socket.query('UPDATE `rooms` SET `data` = ? WHERE `guildRoomID` = ?', [JSON.stringify(data), id]);
  },
};
