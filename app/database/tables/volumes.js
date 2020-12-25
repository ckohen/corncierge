'use strict';

module.exports = {
  /**
   * Get volume data.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, volume FROM `volumes`');
  },

  /**
   * Add a guild to volumes
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `volumes` (guildID, volume) VALUES (?, '1')", [id]);
  },

  /**
   * Remove a guild from volumes
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `volumes` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the volume for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {string} volume the new volume to save
   * @returns {Promise<void>}
   */
  edit(socket, id, volume) {
    return socket.query('UPDATE `volumes` SET `volume` = ? WHERE `guildID` = ?', [volume, id]);
  },
};
