'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get reaction manager settings.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT guildID, channelID, messageID, roles FROM `reactionroles`')
            .then((all) => {
                all.forEach((row) => {
                    row.roles = JSON.parse(row.roles);
                });
                return all;
            });
    },

    /**
     * Add a guild to the reactionmanager
     * @param {DatabaseManager} socket
     * @param {string} id
     * @returns {Promise}
     */
    add(socket, id) {
        return socket.query(
            'INSERT INTO `reactionroles` (guildID, channelID, messageID, roles) VALUES (?, \'\', \'\', \'{}\')',
            [id],
        );
    },

    /**
     * Removes a guild from the reactionmanager
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'DELETE FROM `reactionroles` WHERE `guildID` = ?',
            [id],
        );
    },

    /**
     * Edit the reaction role manager for a guild
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {string} channelID 
     * @param {string} messageID
     * @param {Object} roles
     * @returns {Promise}
     */
    edit(socket, id, channelID, messageID, roles) {
        return socket.query(
            'UPDATE `reactionroles` SET `channelID` = ?, `messageID` = ?, `roles` = ? WHERE `guildID` = ?',
            [channelID, messageID, JSON.stringify(roles), id]
        );
    },
}