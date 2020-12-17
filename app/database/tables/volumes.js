'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get volume data.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, volume FROM `volumes`');
    },

    /**
     * Add a guild to volumes
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `volumes` (guildID, volume) VALUES (?, \'1\')',
            [id],
        );
    },

    /**
     * Remove a guild from volumes
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `volumes` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the volume for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {string} volume 
     * @returns {Promise}
     */
    edit(socket, id, volume) {
        return socket.query(
            'UPDATE `volumes` SET `volume` = ? WHERE `guildID` = ?',
            [volume, id]
        );
    },
}