'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get rooms.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildRoomID, data FROM `rooms`')
            .then((all) => {
                all.forEach((row) => {
                    row.data = JSON.parse(row.data);
                });
                return all;
            });
    },

    /**
     * Add a room to the room manager
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `rooms` (guildRoomID, data) VALUES (?, \'{}\')',
            [id],
        );
    },

    /**
     * Remove a room from the room manager
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `rooms` WHERE `guildRoomID` = ?',
            [id],
        );
    },

    /**
     * Edit a room
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {Object} data 
     * @returns {Promise}
     */
    edit(socket, id, data) {
        return socket.query(
            'UPDATE `rooms` SET `data` = ? WHERE `guildRoomID` = ?',
            [JSON.stringify(data), id]
        );
    },
}