'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the volumes database table
 * @extends {BaseTable}
 */
class volumesTable extends BaseTable {
  /**
   * Get volume data.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, volume FROM `volumes`');
  }

  /**
   * Add a guild to volumes
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `volumes` (guildID, volume) VALUES (?, '1')", [id]);
  }

  /**
   * Remove a guild from volumes
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `volumes` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the volume for a guild
   * @param {string} id the guild id to edit in the database
   * @param {string} volume the new volume to save
   * @returns {Promise<void>}
   */
  edit(id, volume) {
    return this.socket.query('UPDATE `volumes` SET `volume` = ? WHERE `guildID` = ?', [volume, id]);
  }
}

module.exports = volumesTable;
