'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the streaming database table
 * @extends {BaseTable}
 */
class streamingTable extends BaseTable {
  /**
   * Get streaming settings
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT name, channel, role, lastMessage FROM `streaming`');
  }

  /**
   * Update streaming last mesage
   * @param {string} key the stream user to edit
   * @param {string} messageId the snowflake of the last go live message
   * @returns {Promise<void>}
   */
  edit(key, messageId) {
    return this.socket.query('UPDATE `streaming` SET `lastMessage` = ? WHERE `name` = ?', [messageId, key]);
  }
}

module.exports = streamingTable;
