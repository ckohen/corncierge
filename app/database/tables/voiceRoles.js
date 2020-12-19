'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get voice role settings.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, data FROM `voiceroles`')
            .then((all) => {
                all.forEach((row) => {
                    row.data = JSON.parse(row.data);
                });
                return all;
            });
    },

    /**
     * Add a guild to the voicemanager
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `voiceroles` (guildID, data) VALUES (?, \'{}\')',
            [id],
        );
    },

    /**
     * Remove a guild from the voicel role manager
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `voiceroles` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the voice role manager for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {Object} data 
     * @returns {Promise}
     */
    edit(socket, id, data) {
        return socket.query(
            'UPDATE `voiceroles` SET `data` = ? WHERE `guildID` = ?',
            [JSON.stringify(data), id]
        );
    },
}