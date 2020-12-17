'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get role manager settings.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, addRoles, removeRoles FROM `rolemanager`')
            .then((all) => {
                all.forEach((row) => {
                    row.addRoles = JSON.parse(row.addRoles);
                    row.removeRoles = JSON.parse(row.removeRoles);
                });
                return all;
            });
    },

    /**
     * Add a guild to the rolemanager
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `rolemanager` (guildID, addRoles, removeRoles) VALUES (?, \'{}\', \'{}\')',
            [id],
        );
    },

    /**
     * Removes a guild from the rolemanager
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `rolemanager` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the role manager for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {Object} addRoles 
     * @param {Object} removeRoles 
     * @returns {Promise}
     */
    edit(socket, id, addRoles, removeRoles) {
        return socket.query(
            'UPDATE `rolemanager` SET `addRoles` = ?, `removeRoles` = ? WHERE `guildID` = ?',
            [JSON.stringify(addRoles), JSON.stringify(removeRoles), id]
        );
    },
}