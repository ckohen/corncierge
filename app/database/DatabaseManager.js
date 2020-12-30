'use strict';

const mysql = require('mysql2');
const tables = require('./tables');
const BaseManager = require('../managers/BaseManager');

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
     */

    /**
     * The database tables.
     * @type {Object}
     */
    this.tables = tables;
  }

  /**
   * Create a connection to the database.
   * @returns {Promise<Connection>}
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

  /**
   * Gets the databse table specified
   * @param {string} slug the name of the table to get
   * @returns {Promise<Object[]>}
   */
  get(slug) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.get !== 'function') {
      this.app.log.warn(module, `Table does not have get method: ${slug}`);
      return Promise.reject(new Error('Table Get'));
    }

    return table.get(this);
  }

  /**
   * Adds a new entry to the table specified
   * @param {string} slug the name of the table to add to
   * @param {Array} args arguments to pass to the entry creation
   * @returns {Promise<void>}
   */
  add(slug, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.add !== 'function') {
      this.app.log.warn(module, `Table does not have add method: ${slug}`);
      return Promise.reject(new Error('Table Add'));
    }

    return table.add(this, ...args);
  }

  /**
   * Removes an entry from the table specified
   * @param {string} slug the name of the table to remove from
   * @param {Array} args arguments to pass that identify the deletion
   * @returns {Promise<void>}
   */
  delete(slug, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.delete !== 'function') {
      this.app.log.warn(module, `Table does not have delete method: ${slug}`);
      return Promise.reject(new Error('Table Delete'));
    }

    return table.delete(this, ...args);
  }

  /**
   * Edits the data for a row in the table specified
   * @param {string} slug the name of the table to edit
   * @param {string} [property] the name of a specific property to edit
   * @param {Array} args arguments to pass to the editor
   * @returns {Promise<void>}
   */
  edit(slug, property, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.edit !== 'function') {
      this.app.log.warn(module, `Table does not have edit method: ${slug}`);
      return Promise.reject(new Error('Table Edit'));
    }

    if (typeof property !== 'string') {
      args = property;
      property = undefined;
      return table.edit(this, ...args);
    } else {
      return table.edit(this, property, ...args);
    }
  }
}

module.exports = DatabaseManager;
