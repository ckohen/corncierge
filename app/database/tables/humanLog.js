'use strict';

module.exports = {
  /**
   * Add a human-initiated log entry.
   * @param {DatabaseManager} socket the database manager to query with
   * @param {...*} values extra parameters to pass to the query
   * @returns {Promise<void>}
   */
  add(socket, ...values) {
    return socket
      .query(
        /* eslint-disable-next-line max-len */
        'INSERT INTO `log_human` (action, user, user_id, moderator, moderator_id, duration, reason, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        values,
      )
      .catch(err => this.app.log.out('warn', module, err));
  },
};
