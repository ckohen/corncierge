'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the humanLog database table
 * @extends {BaseTable}
 */
class humanLogTable extends BaseTable {
  /**
   * Add a human-initiated log entry.
   * @param {...*} values extra parameters to pass to the query
   * @returns {Promise<void>}
   */
  add(...values) {
    return this.socket
      .query(
        /* eslint-disable-next-line max-len */
        'INSERT INTO `log_human` (action, user, user_id, moderator, moderator_id, duration, reason, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        values,
      )
      .catch(err => this.app.log.warn(module, err));
  }
}

module.exports = humanLogTable;
