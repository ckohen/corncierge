'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the randomChannels database table
 * @extends {BaseTable}
 */
class randomChannelsTable extends BaseTable {
  /**
   * Get random channel data.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, toChannel, fromChannel FROM `randomchannels`');
  }

  /**
   * Add a guild to random channels
   * @param {string} id the guild id to add to the database
   * @returns {Promise}<void>
   */
  add(id) {
    return this.socket.query("INSERT INTO `randomchannels` (guildID, toChannel, fromChannel) VALUES (?, '', '')", [id]);
  }

  /**
   * Remove a guild from random channels
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `randomchannels` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the random channels for a guild
   * @param {string} id the guild id to edit in the database
   * @param {string} toChannel the snowflake id of the stored destinaton channel
   * @param {string} fromChannel the snowflake id of the stored source channel
   * @returns {Promise<void>}
   */
  edit(id, toChannel, fromChannel) {
    return this.socket.query('UPDATE `randomchannels` SET `toChannel` = ?, `fromChannel` = ? WHERE `guildID` = ?', [toChannel, fromChannel, id]);
  }
}

module.exports = randomChannelsTable;
