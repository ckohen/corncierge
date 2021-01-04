'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the ircFilters database table
 * @extends {BaseTable}
 */
class ircFiltersTable extends BaseTable {
  /**
   * Get all IRC moderation filters.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT id, type, input, duration, output FROM `filters` WHERE `deleted_at` IS NULL ORDER BY `type` ASC');
  }
}

module.exports = ircFiltersTable;
