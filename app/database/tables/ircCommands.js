'use strict';

module.exports = {
  /**
   * Get all IRC commands.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query(
      'SELECT id, LOWER(input) as input, method, output, locked, prefix, count, restriction as level FROM `commands` WHERE `deleted_at` IS NULL',
    );
  },

  /**
   * Add an IRC command.
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} input what the command responds to
   * @param {string} output what to display as an output when the command is fired
   * @param {boolean} prefix whether or not a prefix is required for this command
   * @returns {Promise<void>}
   */
  add(socket, input, output, prefix) {
    return socket.query(
      'INSERT INTO `commands` (input, method, output, locked, prefix, count, created_at, updated_at) VALUES (?, NULL, ?, 0, ?, 0, NOW(), NOW())',
      [input, output, prefix],
    );
  },

  /**
   * Delete an IRC command.
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the id of the command to delete
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('UPDATE `commands` SET `deleted_at` = NOW() WHERE `id` = ?', [id]);
  },

  /**
   * The type of properties that can be edited for an IRC command:
   * * count
   * * output
   * * restriction
   * * rename
   * @typedef {string} IRCCommandEditProperty
   */

  /**
   * Edits an IRC command.
   * @param {DatabaseManager} socket the database manager to query with
   * @param {IRCCommandEditProperty} property the property to edit, one of {@link IRCCommandEditProperty}
   * @param {number} id the id of the command to update
   * @param  {string} [updated] the new value for the parameter
   * @returns {Promise<void>}
   */
  edit(socket, property, id, updated) {
    switch (property) {
      case 'count':
        return socket.query('UPDATE `commands` SET `count` = count + 1 WHERE `id` = ?', [id]);
      case 'output':
        return socket.query('UPDATE `commands` SET `output` = ?, `updated_at` = NOW() WHERE `id` = ?', [updated, id]);
      case 'restriction':
        return socket.query('UPDATE `commands` SET `restriction` = ?, `updated_at` = NOW() WHERE `id` = ?', [updated, id]);
      case 'rename':
        return socket.query('UPDATE `commands` SET `input` = ?, `updated_at` = NOW() WHERE `id` = ?', [updated, id]);
      default:
    }
    return Promise.reject(new Error(`Invalid Property: ${property}`));
  },
};
