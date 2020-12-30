'use strict';

module.exports = {
  /**
   * Add a bot-initiated log entry.
   * @param {DatabaseManager} socket the database manager to query with
   * @param {...*} values extra parameters to pass to the query
   * @returns {Promise<void>}
   */
  add(socket, ...values) {
    return socket
      .query('INSERT INTO `log_bot` (filter_id, action, user, user_id, duration, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', values)
      .catch(err => this.app.log.warn(module, err));
  },
};
