'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the prefixes database table
 * @extends {BaseTable}
 */
class prefixesTable extends BaseTable {
  /**
   * Get prefixes.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, prefix FROM `prefixes`');
  }

  /**
   * Add a guild to prefixes
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `prefixes` (guildID, prefix) VALUES (?, '!')", [id]);
  }

  /**
   * Remove a guild from prefixes
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `prefixes` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the prefix for a guild
   * @param {string} id the guild id to edit in the database
   * @param {string} prefix the new prefix to use
   * @returns {Promise<void>}
   */
  edit(id, prefix) {
    return this.socket.query('UPDATE `prefixes` SET `prefix` = ? WHERE `guildID` = ?', [prefix, id]);
  }
}

module.exports = prefixesTable;
