'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the botLog database table
 * @extends {BaseTable}
 */
class botLogTable extends BaseTable {
  /**
   * Add a bot-initiated log entry.
   * @param {...*} values extra parameters to pass to the query
   * @returns {Promise<void>}
   */
  add(...values) {
    return this.socket
      .query('INSERT INTO `log_bot` (filter_id, action, user, user_id, duration, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', values)
      .catch(err => this.app.log.warn(module, err));
  }
}

module.exports = botLogTable;
