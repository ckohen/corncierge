'use strict';

module.exports = {
  /**
   * Get voice role settings.
   * @param {DatabaseManager} socket the database manager to query with
   * @returns {Promise<Object[]>}
   */
  get(socket) {
    return socket.query('SELECT guildID, data FROM `voiceroles`').then(all => {
      all.forEach(row => {
        row.data = JSON.parse(row.data);
      });
      return all;
    });
  },

  /**
   * Add a guild to the voicemanager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to add to the database
   * @returns {Promise<void>}
   */
  add(socket, id) {
    return socket.query("INSERT INTO `voiceroles` (guildID, data) VALUES (?, '{}')", [id]);
  },

  /**
   * Remove a guild from the voicel role manager
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to remove from the database
   * @returns {Promise<void>}
   */
  delete(socket, id) {
    return socket.query('DELETE FROM `voiceroles` WHERE `guildID` = ?', [id]);
  },

  /**
   * Edit the voice role manager for a guild
   * @param {DatabaseManager} socket the database manager to query with
   * @param {string} id the guild id to edit in the database
   * @param {Object} data an object containing key value pairs of role snowflakes and an array of channel snowflakes
   * @returns {Promise<void>}
   */
  edit(socket, id, data) {
    return socket.query('UPDATE `voiceroles` SET `data` = ? WHERE `guildID` = ?', [JSON.stringify(data), id]);
  },
};
