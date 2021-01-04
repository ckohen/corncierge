'use strict';

/**
 * Represents API methods for any database table
 * @abstract
 */
class BaseTable {
  constructor(socket) {
    /**
     * The database manager that this table resides in
     * @name BaseTable#socket
     * @type {DatabaseManager}
     */
    Object.defineProperty(this, 'socket', { value: socket });
  }

  /**
   * Parses stringified JSON from the database fetch
   * @param {string[]} columns the columns that contain json data
   * @param {Object} data the data returned from the database
   * @returns {Object}
   */
  parseJSON(columns, data) {
    data.forEach(row => {
      columns.forEach(column => {
        row[column] = JSON.parse(row[column]);
      });
    });
    return data;
  }
}

module.exports = BaseTable;
