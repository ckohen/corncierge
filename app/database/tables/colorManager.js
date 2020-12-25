'use strict';

module.exports = {
  /**
   * Get color manager settings.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, roles, snowflakes FROM `colormanager`').then(all => {
      all.forEach(row => {
        row.roles = JSON.parse(row.roles);
        row.snowflakes = JSON.parse(row.snowflakes);
      });
      return all;
    });
  },

  /**
   * Add a guild to the colormanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `colormanager` (guildID, roles, snowflakes) VALUES (?, '{}', '[]')", [id]);
  },

  /**
   * Removes a guild from the colormanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `colormanager` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the color manager for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {Object} roles an object with a channel id associated with an array of role names
   * @param {string[]} snowflakes an array containing all the snowflakes for the color roles
   * @returns {Promise<void>}
   */
  edit(socket, id, roles, snowflakes) {
    return socket.query('UPDATE `colormanager` SET `roles` = ?, `snowflakes` = ? WHERE `guildID` = ?', [JSON.stringify(roles), JSON.stringify(snowflakes), id]);
  },
};
