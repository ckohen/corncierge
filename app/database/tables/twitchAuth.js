'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the twitch user authentication database table
 * @extends {BaseTable}
 */
class twitchAuthTable extends BaseTable {
  /**
   * Get all authenticated users
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT id, accessToken, refreshToken, scopes FROM `twitchauth`').then(this.parseJSON.bind(null, ['scopes']));
  }

  /**
   * Add an authenticated user
   * @param {string} id The id of the user this token belongs to
   * @param {string} access The access token for this user
   * @param {string} refresh The refresh token for this user
   * @param {Object|Array} scopes The scopes that are authorized for this user
   * @returns {Promise<void>}
   */
  add(id, access, refresh, scopes) {
    return this.socket.query('INSERT INTO `twitchauth` (id, accessToken, refreshToken, scopes) VALUES (?, ?, ?, ?)', [
      id,
      access,
      refresh,
      JSON.stringify(scopes),
    ]);
  }

  /**
   * Removes a user that is no longer authenticated
   * @param {string} id The id of the user to remove
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `twitchauth` WHERE `id` = ?', [id]);
  }

  /**
   * Edit an authenticated users detials
   * @param {string} id The id of the user to update
   * @param {string} access The access token for this user
   * @param {string} refresh The refresh token for this user
   * @param {Object|Array} scopes The scopes that are authorized for this user
   * @returns {Promise<void>}
   */
  edit(id, access, refresh, scopes) {
    return this.socket.query('UPDATE `twitchauth` SET `accessToken` = ?, `refreshToken` = ?, `scopes` = ? WHERE `id` = ?', [
      access,
      refresh,
      JSON.stringify(scopes),
      id,
    ]);
  }
}

module.exports = twitchAuthTable;
