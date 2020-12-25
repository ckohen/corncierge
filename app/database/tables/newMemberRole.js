'use strict';

module.exports = {
  /**
   * Get New member role settings.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, roleID, delayTime FROM `newmemberrole`');
  },

  /**
   * Add a new member role setting
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `newmemberrole` (guildID, roleID, delayTime) VALUES (?, '', '0')", [id]);
  },

  /**
   * Removes a new member role setting
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `newmemberrole` WHERE `guildID` = ?', [id]);
  },

  /**
   * Updates a new member role setting
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {string} roleID the id of the role that is assigned
   * @param {string} delayTime the delay time in milliseconds before the role is added
   * @returns {Promise<void>}
   */
  edit(socket, id, roleID, delayTime) {
    return socket.query('UPDATE `newmemberrole` SET `roleID` = ?, `delayTime` = ? WHERE `guildID` = ?', [roleID, delayTime, id]);
  },
};
