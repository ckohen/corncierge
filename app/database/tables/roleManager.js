'use strict';

module.exports = {
  /**
   * Get role manager settings.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, addRoles, removeRoles FROM `rolemanager`').then(all => {
      all.forEach(row => {
        row.addRoles = JSON.parse(row.addRoles);
        row.removeRoles = JSON.parse(row.removeRoles);
      });
      return all;
    });
  },

  /**
   * Add a guild to the rolemanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `rolemanager` (guildID, addRoles, removeRoles) VALUES (?, '{}', '{}')", [id]);
  },

  /**
   * Removes a guild from the rolemanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `rolemanager` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the role manager for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {Object} addRoles an object containing key value pairs of channel snowflakes and an array of role snowflakes
   * @param {Object} removeRoles an object containing key value pairs of channel snowflakes and an array of role snowflakes
   * @returns {Promise<void>}
   */
  edit(socket, id, addRoles, removeRoles) {
    return socket.query('UPDATE `rolemanager` SET `addRoles` = ?, `removeRoles` = ? WHERE `guildID` = ?', [
      JSON.stringify(addRoles),
      JSON.stringify(removeRoles),
      id,
    ]);
  },
};
