'use strict';

const mysql = require('mysql2');
const tables = require('./tables');

/**
 * Database manager for the application.
 * @private
 */
class DatabaseManager {
  /**
   * Create a new database manager instance.
   * @param {Application} app
   * @returns {self}
  */
  constructor(app) {
    /**
     * The application container.
     * @type {Application}
     */
    this.app = app;

    /**
     * The database driver.
     * @type {Pool}
     */
    this.driver = mysql.createPool(this.app.options.database);

    /**
     * The database tables.
     * @type {Object}
     */
    this.tables = tables;
  }

  /**
   * Create a connection to the database.
   * @returns {Promise}
   */
  connection() {
    return new Promise((resolve, reject) => {
      this.driver.getConnection((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * Query the database.
   * @param {string} query
   * @param {Array} [args]
   * @returns {Promise}
   */
  async query(query, args = null) {
    const connection = await this.connection();

    return new Promise((resolve, reject) => {
      connection.execute(query, args, (err, results) => {
        connection.release();
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Gets the databse table specified
   * @param {string} slug the name of the table to get
   * @returns {?Promise}
   */
  get(slug) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.get !== 'function') {
      this.app.log.out('warn', module, `Unknown table: ${slug}`);
      return Promise.reject();
    }

    return table.get(this);
  }

  /**
   * Adds a new entry to the table specified
   * @param {string} slug the name of the table to add to
   * @param {Array} args arguments to pass to the entry creation
   * @returns {?Promise}
   */
  add(slug, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.add !== 'function') {
      this.app.log.out('warn', module, `Unknown table: ${slug}`);
      return Promise.reject();
    }
    
    return table.add(this, ...args);
  }

  /**
   * Removes an entry from the table specified
   * @param {string} slug the name of the table to remove from
   * @param {Array} args arguments to pass that identify the deletion
   * @returns {?Promise}
   */
  delete(slug, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.delete !== 'function') {
      this.app.log.out('warn', module, `Unknown table: ${slug}`);
      return Promise.reject();
    }
    
    return table.delete(this, ...args);
  }

  /**
   * Edits the data for a row in the table specified
   * @param {string} slug the name of the table to edit
   * @param {string} [property] the name of a specific property to edit
   * @param {Array} args arguments to pass to the editor
   * @returns {?Promise}
   */
  edit(slug, property, args) {
    const table = this.tables[slug];

    if (typeof table !== 'object' || typeof table.edit !== 'function') {
      this.app.log.out('warn', module, `Unknown table: ${slug}`);
      return Promise.reject();
    }

    if(typeof property !== 'string') {
      args = property;
      property = undefined;
      return table.edit(this, ...args);
    } else {
      return table.edit(this, property, ...args);
    }
  }
}

module.exports = DatabaseManager;
