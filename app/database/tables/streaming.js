'use strict';

module.exports = {
  /**
   * Get streaming settings
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT name, channel, role, lastMessage FROM `streaming`');
  },

  /**
   * Update streaming last mesage
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} key the stream user to edit
   * @param {string} messageID the snowflake of the last go live message
   * @returns {Promise<void>}
   */
  edit(socket, key, messageID) {
    return socket.query('UPDATE `streaming` SET `lastMessage` = ? WHERE `name` = ?', [messageID, key]);
  },
};
