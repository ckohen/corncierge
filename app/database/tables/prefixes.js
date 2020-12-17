'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get prefixes.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, prefix FROM `prefixes`');
    },

    /**
     * Add a guild to prefixes
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `prefixes` (guildID, prefix) VALUES (?, \'!\')',
            [id],
        );
    },

    /**
     * Remove a guild from prefixes
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `prefixes` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the prefix for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {string} prefix 
     * @returns {Promise}
     */
    edit(socket, id, prefix) {
        return socket.query(
            'UPDATE `prefixes` SET `prefix` = ? WHERE `guildID` = ?',
            [prefix, id]
        );
    },
}