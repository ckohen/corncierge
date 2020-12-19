'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get New member role settings.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, roleID, delayTime FROM `newmemberrole`')
    },

    /**
     * Add a new member role setting
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `newmemberrole` (guildID, roleID, delayTime) VALUES (?, \'\', \'0\')',
            [id],
        );
    },

    /**
     * Removes a new member role setting
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `newmemberrole` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Updates a new member role setting
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {string} roleID 
     * @param {string} delayTime 
     * @returns {Promise}
     */
    edit(socket, id, roleID, delayTime) {
        return socket.query(
            'UPDATE `newmemberrole` SET `roleID` = ?, `delayTime` = ? WHERE `guildID` = ?',
            [roleID, delayTime, id],
        );
    },
}