'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the settings database table
 * @extends {BaseTable}
 */
class settingsTable extends BaseTable {
  /**
   * Get all settings
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT name, value FROM `settings`');
  }

  /**
   * Add a setting
   * @param {string} name the name of the setting to add
   * @param {string} value the value of the new setting
   * @returns {Promise<void>}
   */
  add(name, value) {
    return this.socket.query('INSERT INTO `settings` (name, value) VALUES (?, ?)', [name, value]);
  }

  /**
   * Edit a setting
   * @param {string} name the name of the setting to edit
   * @param {string} value the new value for the setting
   * @returns {Promise<void>}
   */
  edit(name, value) {
    return this.socket.query('UPDATE `settings` SET `value` = ? WHERE `name` = ?', [value, name]);
  }
}

module.exports = settingsTable;
