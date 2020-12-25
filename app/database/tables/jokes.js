'use strict';

module.exports = {
  /**
   * Get all jokes.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT id, output FROM `jokes` WHERE `deleted_at` IS NULL ORDER BY RAND()');
  },
};
