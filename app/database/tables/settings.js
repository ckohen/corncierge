'use strict';

module.exports = {
  /**
   * Get all settings
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT name, value FROM `settings`');
  },

  /**
   * Add a setting
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} name the name of the setting to add
   * @param {string} value the value of the new setting
   * @returns {Promise<void>}
   */
  add(socket, name, value) {
    return socket.query('INSERT INTO `settings` (name, value) VALUES (?, ?)', [name, value]);
  },

  /**
   * Edit a setting
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} name the name of the setting to edit
   * @param {string} value the new value for the setting
   * @returns {Promise<void>}
   */
  edit(socket, name, value) {
    return socket.query('UPDATE `settings` SET `value` = ? WHERE `name` = ?', [value, name]);
  },
};
