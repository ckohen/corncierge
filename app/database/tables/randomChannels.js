'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get random channel data.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, toChannel, fromChannel FROM `randomchannels`');
    },

    /**
     * Add a guild to random channels
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `randomchannels` (guildID, toChannel, fromChannel) VALUES (?, \'\', \'\')',
            [id],
        );
    },

    /**
     * Remove a guild from random channels
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `randomchannels` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the random channels for a guild
     * @param {DatabaseManager} socket 
     * @param {string} toChannel 
     * @param {string} fromChannel 
     * @returns {Promise}
     */
    edit(socket, id, toChannel, fromChannel) {
        return socket.query(
            'UPDATE `randomchannels` SET `toChannel` = ?, `fromChannel` = ? WHERE `guildID` = ?',
            [toChannel, fromChannel, id]
        );
    },
}