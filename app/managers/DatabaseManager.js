'use strict';

const mysql = require('mysql2');
const BaseManager = require('./BaseManager');
const TableManager = require('../database/tables/TableManager');

/**
 * Database manager for the application.
 * @extends {BaseManager}
 */
class DatabaseManager extends BaseManager {
  constructor(app) {
    super(app, mysql.createPool(app.options.database), app.options.database);

    /**
     * The database driver.
     * @type {Pool}
     * @name DatabaseManager#driver
     * @private
     */

    /**
     * The database tables.
     * @type {TableManager}
     */
    this.tables = new TableManager(this);
  }

  /**
   * Create a connection to the database.
   * @returns {Promise<Connection>}
   * @private
   */
  connection() {
    return new Promise((resolve, reject) => {
      this.driver.getConnection((err, connection) => {
        if (err) return reject(err);
        return resolve(connection);
      });
    });
  }

  /**
   * Query the database.
   * @param {string} query the query to make
   * @param {Array} [args=null] the extra args to pass with the query
   * @returns {Promise}
   */
  async query(query, args = null) {
    const connection = await this.connection();

    return new Promise((resolve, reject) => {
      connection.execute(query, args, (err, results) => {
        connection.release();
        if (err) return reject(err);
        return resolve(results);
      });
    });
  }
}

module.exports = DatabaseManager;
