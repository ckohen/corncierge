'use strict';

module.exports = {
  /**
   * Get random channel data.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, toChannel, fromChannel FROM `randomchannels`');
  },

  /**
   * Add a guild to random channels
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise}<void>
   */
  add(socket, id) {
    return socket.query("INSERT INTO `randomchannels` (guildID, toChannel, fromChannel) VALUES (?, '', '')", [id]);
  },

  /**
   * Remove a guild from random channels
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `randomchannels` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the random channels for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {string} toChannel the snowflake id of the stored destinaton channel
   * @param {string} fromChannel the snowflake id of the stored source channel
   * @returns {Promise<void>}
   */
  edit(socket, id, toChannel, fromChannel) {
    return socket.query('UPDATE `randomchannels` SET `toChannel` = ?, `fromChannel` = ? WHERE `guildID` = ?', [toChannel, fromChannel, id]);
  },
};
