'use strict';

const BaseTable = require('./BaseTable');

/**
 * Contains API methods for the reactionRoles database table
 * @extends {BaseTable}
 */
class reactionRolesTable extends BaseTable {
  /**
   * Get reaction manager settings.
   * @returns {Promise<Object[]>}
   */
  get() {
    return this.socket.query('SELECT guildID, channelID, messageID, roles FROM `reactionroles`').then(this.parseJSON.bind(null, ['roles']));
  }

  /**
   * Add a guild to the reactionmanager
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(id) {
    return this.socket.query("INSERT INTO `reactionroles` (guildID, channelID, messageID, roles) VALUES (?, '', '', '{}')", [id]);
  }

  /**
   * Removes a guild from the reactionmanager
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(id) {
    return this.socket.query('DELETE FROM `reactionroles` WHERE `guildID` = ?', [id]);
  }

  /**
   * Edit the reaction role manager for a guild
   * @param {string} id the guild id to edit in the database
   * @param {string} channelID the stored snowflake of the channel where the reaction message is
   * @param {string} messageID the store snowflake of the message that is reacted to
   * @param {Object} roles an object containing key value pairs of emote snowflakes and an array of role snowflakes
   * @returns {Promise<void>}
   */
  edit(id, channelID, messageID, roles) {
    return this.socket.query('UPDATE `reactionroles` SET `channelID` = ?, `messageID` = ?, `roles` = ? WHERE `guildID` = ?', [
      channelID,
      messageID,
      JSON.stringify(roles),
      id,
    ]);
  }
}

module.exports = reactionRolesTable;
