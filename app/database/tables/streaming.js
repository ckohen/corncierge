'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get streaming settings
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT name, channel, role, lastMessage FROM `streaming`');
    },

    /**
     * Update streaming last mesage
     * @param {DatabaseManager} socket 
     * @param {string} key 
     * @param {string} messageID 
     * @returns {Promise}
     */
    edit(socket, key, messageID) {
        return socket.query(
            'UPDATE `streaming` SET `lastMessage` = ? WHERE `name` = ?',
            [messageID, key],
        );
    },
}