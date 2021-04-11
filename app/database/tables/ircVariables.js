'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the ircVariables database table
 * @extends {BaseTable}
 */
class ircVariablesTable extends BaseTable {
  /**
   * Get all IRC variables.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT id, LOWER(name) as name, value, channel FROM `ircvariables`');
  }

  /**
   * Add an IRC variable.
   * @param {string} name what the variable is named
   * @param {string} channel the channel to which this variable applies
   * @param {string} [value] the value to replace this variable with in commands
   * @returns {Promise<void>}
   */
  add(name, channel, value) {
    return this.socket.query('INSERT INTO `ircvariables` (name, value, channel) VALUES (?, ?, ?)', [name, value ?? null, channel]);
  }

  /**
   * Delete an IRC variable.
   * @param {string} id the id of the variable to delete
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `ircvariables` WHERE `id` = ?', [id]);
  }

  /**
   * Edits an IRC variable.
   * @param {number} id the id of the variable to update
   * @param  {string} updated the new value for the variable
   * @returns {Promise<void>}
   */
  edit(id, updated) {
    return this.socket.query('UPDATE `ircvariables` SET `value` = ? WHERE `id` = ?', [updated, id]);
  }
}

module.exports = ircVariablesTable;
