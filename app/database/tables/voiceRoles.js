'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the voiceRoles database table
 * @extends {BaseTable}
 */
class voiceRolesTable extends BaseTable {
  /**
   * Get voice role settings.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, data FROM `voiceroles`').then(this.parseJSON.bind(null, ['data']));
  }

  /**
   * Add a guild to the voicemanager
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `voiceroles` (guildID, data) VALUES (?, '{}')", [id]);
  }

  /**
   * Remove a guild from the voicel role manager
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `voiceroles` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the voice role manager for a guild
   * @param {string} id the guild id to edit in the database
   * @param {Object} data an object containing key value pairs of role snowflakes and an array of channel snowflakes
   * @returns {Promise<void>}
   */
  edit(id, data) {
    return this.socket.query('UPDATE `voiceroles` SET `data` = ? WHERE `guildID` = ?', [JSON.stringify(data), id]);
  }
}

module.exports = voiceRolesTable;
