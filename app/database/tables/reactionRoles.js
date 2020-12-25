'use strict';

module.exports = {
  /**
   * Get reaction manager settings.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, channelID, messageID, roles FROM `reactionroles`').then(all => {
      all.forEach(row => {
        row.roles = JSON.parse(row.roles);
      });
      return all;
    });
  },

  /**
   * Add a guild to the reactionmanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `reactionroles` (guildID, channelID, messageID, roles) VALUES (?, '', '', '{}')", [id]);
  },

  /**
   * Removes a guild from the reactionmanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `reactionroles` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the reaction role manager for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {string} channelID the stored snowflake of the channel where the reaction message is
   * @param {string} messageID the store snowflake of the message that is reacted to
   * @param {Object} roles an object containing key value pairs of emote snowflakes and an array of role snowflakes
   * @returns {Promise<void>}
   */
  edit(socket, id, channelID, messageID, roles) {
    return socket.query('UPDATE `reactionroles` SET `channelID` = ?, `messageID` = ?, `roles` = ? WHERE `guildID` = ?', [
      channelID,
      messageID,
      JSON.stringify(roles),
      id,
    ]);
  },
};
