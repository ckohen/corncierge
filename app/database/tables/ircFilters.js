'use strict';

module.exports = {
  /**
   * Get all IRC moderation filters.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT id, type, input, duration, output FROM `filters` WHERE `deleted_at` IS NULL ORDER BY `type` ASC');
  },
};
