'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the jokes database table
 * @extends {BaseTable}
 */
class jokesTable extends BaseTable {
  /**
   * Get all jokes.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT id, output FROM `jokes` WHERE `deleted_at` IS NULL ORDER BY RAND()');
  }
}

module.exports = jokesTable;
