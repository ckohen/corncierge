'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the colorManager database table
 * @extends {BaseTable}
 */
class colorManagerTable extends BaseTable {
  /**
   * Get color manager settings.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, roles, snowflakes FROM `colormanager`').then(this.parseJSON.bind(null, ['roles', 'snowflakes']));
  }

  /**
   * Add a guild to the colormanager
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `colormanager` (guildID, roles, snowflakes) VALUES (?, '{}', '[]')", [id]);
  }

  /**
   * Removes a guild from the colormanager
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `colormanager` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the color manager for a guild
   * @param {string} id the guild id to edit in the database
   * @param {Object} roles an object with a channel id associated with an array of role names
   * @param {string[]} snowflakes an array containing all the snowflakes for the color roles
   * @returns {Promise<void>}
   */
  edit(id, roles, snowflakes) {
    return this.socket.query('UPDATE `colormanager` SET `roles` = ?, `snowflakes` = ? WHERE `guildID` = ?', [
      JSON.stringify(roles),
      JSON.stringify(snowflakes),
      id,
    ]);
  }
}

module.exports = colorManagerTable;
