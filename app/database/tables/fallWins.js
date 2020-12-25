'use strict';

module.exports = {
  /**
   * Get all Fall Guys Win data.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT id, count FROM `fallwins`');
  },

  /**
   * Add a Fall Guys Win counter
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the user id to add to the database
   * @param {number} count the number of wins to set
   * @returns {Promise<void>}
   */
  add(socket, id, count) {
    return socket.query('INSERT INTO `fallwins` (id, count) VALUES (?, ?)', [id, count]);
  },

  /**
   * Edit Fall Guys Wins
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the user id to edit in the database
   * @param {number} wins the number of wins to set
   * @returns {Promise<void>}
   */
  edit(socket, id, wins) {
    return socket.query('UPDATE `fallwins` SET `count` = ? WHERE `id` = ?', [wins, id]);
  },
};
