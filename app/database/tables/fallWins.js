'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the fallWins database table
 * @extends {BaseTable}
 */
class fallWinsTable extends BaseTable {
  /**
   * Get all Fall Guys Win data.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT id, count FROM `fallwins`');
  }

  /**
   * Add a Fall Guys Win counter
   * @param {string} id the user id to add to the database
   * @param {number} count the number of wins to set
   * @returns {Promise<void>}
   */
  add(id, count) {
    return this.socket.query('INSERT INTO `fallwins` (id, count) VALUES (?, ?)', [id, count]);
  }

  /**
   * Edit Fall Guys Wins
   * @param {string} id the user id to edit in the database
   * @param {number} wins the number of wins to set
   * @returns {Promise<void>}
   */
  edit(id, wins) {
    return this.socket.query('UPDATE `fallwins` SET `count` = ? WHERE `id` = ?', [wins, id]);
  }
}

module.exports = fallWinsTable;
