'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the roleManager database table
 * @extends {BaseTable}
 */
class roleManagerTable extends BaseTable {
  /**
   * Get role manager settings.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket
      .query('SELECT guildID as guildId, addRoles, removeRoles FROM `rolemanager`')
      .then(this.parseJSON.bind(null, ['addRoles', 'removeRoles']));
  }

  /**
   * Add a guild to the rolemanager
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `rolemanager` (guildID, addRoles, removeRoles) VALUES (?, '{}', '{}')", [id]);
  }

  /**
   * Removes a guild from the rolemanager
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `rolemanager` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the role manager for a guild
   * @param {string} id the guild id to edit in the database
   * @param {Object} addRoles an object containing key value pairs of channel snowflakes and an array of role snowflakes
   * @param {Object} removeRoles an object containing key value pairs of channel snowflakes and an array of role snowflakes
   * @returns {Promise<void>}
   */
  edit(id, addRoles, removeRoles) {
    return this.socket.query('UPDATE `rolemanager` SET `addRoles` = ?, `removeRoles` = ? WHERE `guildID` = ?', [
      JSON.stringify(addRoles),
      JSON.stringify(removeRoles),
      id,
    ]);
  }
}

module.exports = roleManagerTable;
