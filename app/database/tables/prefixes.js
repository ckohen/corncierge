'use strict';

module.exports = {
  /**
   * Get prefixes.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, prefix FROM `prefixes`');
  },

  /**
   * Add a guild to prefixes
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `prefixes` (guildID, prefix) VALUES (?, '!')", [id]);
  },

  /**
   * Remove a guild from prefixes
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `prefixes` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the prefix for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {string} prefix the new prefix to use
   * @returns {Promise<void>}
   */
  edit(socket, id, prefix) {
    return socket.query('UPDATE `prefixes` SET `prefix` = ? WHERE `guildID` = ?', [prefix, id]);
  },
};
