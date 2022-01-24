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
   * Get a single authenticated users
   * @param {string} id the id of the user to get tokens for
   * @returns {Promise<Object>}
   */
  getSingle(id) {
    const data = this.socket.query('SELECT id, accessToken, refreshToken, scopes FROM `twitchauth` WHERE `id` = ?', [id]);
    return this.parseJSON(['scopes'], data)[0];
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
   * Add or update an authenticated user
   * @param {string} id The id of the user this token belongs to
   * @param {string} access The access token for this user
   * @param {string} refresh The refresh token for this user
   * @param {Object|Array} scopes The scopes that are authorized for this user
   * @returns {Promise<void>}
   */
  upsert(id, access, refresh, scopes) {
    return this.socket.query(
      'INSERT INTO `twitchauth` (id, accessToken, refreshToken, scopes) VALUES (?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE `accessToken` = VALUE(accessToken), `refreshToken` = VALUE(refreshToken), `scopes` = VALUE(scopes)',
      [id, access, refresh, JSON.stringify(scopes)],
    );
  }

  /**
   * Add or update an authenticated user
   * @param {Object[]} data the data for all the users to upsert
   * @returns {Promise<void>}
   */
  upsertMultiple(data) {
    return this.socket.query(
      'INSERT INTO `twitchauth` (id, accessToken, refreshToken, scopes) VALUES ? ' +
        'ON DUPLICATE KEY UPDATE `accessToken` = VALUE(accessToken), `refreshToken` = VALUE(refreshToken), `scopes` = VALUE(scopes)',
      [data.map(auth => `(${auth.id}, ${auth.accessToken}, ${auth.refreshToken}, ${auth.scopes})`).join(',')],
    );
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
