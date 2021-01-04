'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the newMemberRole database table
 * @extends {BaseTable}
 */
class newMemberRoleTable extends BaseTable {
  /**
   * Get New member role settings.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, roleID, delayTime FROM `newmemberrole`');
  }

  /**
   * Add a new member role setting
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `newmemberrole` (guildID, roleID, delayTime) VALUES (?, '', '0')", [id]);
  }

  /**
   * Removes a new member role setting
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `newmemberrole` WHERE `guildID` = ?', [id]);
  }

  /**
   * Updates a new member role setting
   * @param {string} id the guild id to edit in the database
   * @param {string} roleID the id of the role that is assigned
   * @param {string} delayTime the delay time in milliseconds before the role is added
   * @returns {Promise<void>}
   */
  edit(id, roleID, delayTime) {
    return this.socket.query('UPDATE `newmemberrole` SET `roleID` = ?, `delayTime` = ? WHERE `guildID` = ?', [roleID, delayTime, id]);
  }
}

module.exports = newMemberRoleTable;
