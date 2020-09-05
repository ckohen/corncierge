'use strict';

const mysql = require('mysql2');

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
   * Get all settings.
   * @returns {Promise}
   */
  getSettings() {
    return this.query('SELECT name, value FROM `settings`');
  }

  /**
   * Get all IRC moderation filters.
   * @returns {Promise}
   */
  getIrcFilters() {
    return this.query(
      'SELECT id, type, input, duration, output FROM `filters` WHERE `deleted_at` IS NULL ORDER BY `type` ASC',
    );
  }

  /**
   * Get all IRC commands.
   * @returns {Promise}
   */
  getIrcCommands() {
    return this.query(
      'SELECT id, LOWER(input) as input, method, output, locked, prefix, count, restriction as level FROM `commands` WHERE `deleted_at` IS NULL',
    );
  }

  /**
   * Count an IRC command.
   * @param {number} id
   * @returns {Promise}
   */
  countIrcCommand(id) {
    return this.query(
      'UPDATE `commands` SET `count` = count + 1 WHERE `id` = ?',
      [id],
    );
  }

  /**
   * Add an IRC command.
   * @param {string} input
   * @param {string} output
   * @param {Boolean} prefix
   * @returns {Promise}
   */
  addIrcCommand(input, output, prefix) {
    return this.query(
      'INSERT INTO `commands` (input, method, output, locked, prefix, count, created_at, updated_at) VALUES (?, NULL, ?, 0, ?, 0, NOW(), NOW())',
      [input, output, prefix],
    );
  }

  /**
   * Edit an IRC command.
   * @param {number} id
   * @param {string} output
   * @returns {Promise}
   */
  editIrcCommand(id, output) {
    return this.query(
      'UPDATE `commands` SET `output` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [output, id],
    );
  }

  /**
   * Edit an IRC command restriction requirenment.
   * @param {number} id
   * @param {string} restriction
   * @returns {Promise}
   */
  editIrcRestriction(id, restriction) {
    return this.query(
      'UPDATE `commands` SET `restriction` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [restriction, id],
    );
  }

  /**
   * Add an IRC command.
   * @param {number} id
   * @param {number} count
   * @returns {Promise}
   */
  addFallWin(id, count) {
    return this.query(
      'INSERT INTO `fallwins` (id, count) VALUES (?, ?)',
      [id, count],
    );
  }

  /**
   * Edit Fall Guys Wins
   * @param {number} id
   * @param {string} wins
   * @returns {Promise}
   */
  editFallWins(id, wins) {
    return this.query(
      'UPDATE `fallwins` SET `count` = ? WHERE `id` = ?',
      [wins, id],
    );
  }

    /**
   * Get all Fall Guys Win data
   * @returns {Promise}
   */
  getFallWins() {
    return this.query(
      'SELECT id, count FROM `fallwins`',
    );
  }


/**
   * add a setting.
   * @param {string} name
   * @param {string} value
   * @returns {Promise}
   */
  addSetting(name, value) {
    return this.query(
      'INSERT INTO `settings` (name, value) VALUES (?, ?)',
      [name, value],
    );
  }

  /**
   * Edit a setting.
   * @param {string} name
   * @param {string} value
   * @returns {Promise}
   */
  editSetting(name, value) {
    return this.query(
      'UPDATE `settings` SET `value` = ? WHERE `name` = ?',
      [value, name],
    );
  }

  /**
   * Rename an IRC command.
   * @param {number} id
   * @param {string} input
   * @returns {Promise}
   */
  renameIrcCommand(id, input) {
    return this.query(
      'UPDATE `commands` SET `input` = ?, `updated_at` = NOW() WHERE `id` = ?',
      [input, id],
    );
  }

  /**
   * Delete an IRC command.
   * @param {number} id
   * @returns {Promise}
   */
  deleteIrcCommand(id) {
    return this.query(
      'UPDATE `commands` SET `deleted_at` = NOW() WHERE `id` = ?',
      [id],
    );
  }

  /**
   * Get all jokes.
   * @returns {Promise}
   */
  getJokes() {
    return this.query(
      'SELECT id, output FROM `jokes` WHERE `deleted_at` IS NULL ORDER BY RAND()',
    );
  }

  /**
   * Add a bot-initiated log entry.
   * @param {...*} values
   */
  addBotLog(...values) {
    this.query(
      'INSERT INTO `log_bot` (filter_id, action, user, user_id, duration, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      values,
    ).catch((err) => this.app.log.out('warn', module, err));
  }

  /**
   * Add a human-initiated log entry.
   * @param {...*} values
   */
  addHumanLog(...values) {
    this.query(
      'INSERT INTO `log_human` (action, user, user_id, moderator, moderator_id, duration, reason, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      values,
    ).catch((err) => this.app.log.out('warn', module, err));
  }
}

module.exports = DatabaseManager;
