'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get color manager settings.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, roles, snowflakes FROM `colormanager`')
            .then((all) => {
                all.forEach((row) => {
                    row.roles = JSON.parse(row.roles);
                    row.snowflakes = JSON.parse(row.snowflakes);
                });
                return all;
            });
    },

    /**
     * Add a guild to the colormanager
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `colormanager` (guildID, roles, snowflakes) VALUES (?, \'{}\', \'[]\')',
            [id],
        );
    },

    /**
     * Removes a guild from the colormanager
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `colormanager` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the color manager for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {Object} roles 
     * @param {Object} snowflakes 
     * @returns {Promise}
     */
    edit(socket, id, roles, snowflakes) {
        return socket.query(
            'UPDATE `colormanager` SET `roles` = ?, `snowflakes` = ? WHERE `guildID` = ?',
            [JSON.stringify(roles), JSON.stringify(snowflakes), id]
        );
    },
}