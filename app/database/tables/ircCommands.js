'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get all IRC commands.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query(
            'SELECT id, LOWER(input) as input, method, output, locked, prefix, count, restriction as level FROM `commands` WHERE `deleted_at` IS NULL',
        );
    },

    /**
     * Add an IRC command.
     * @param {DatabaseManager} socket
     * @param {string} input
     * @param {string} output
     * @param {Boolean} prefix
     * @returns {Promise}
     */
    add(socket, input, output, prefix) {
        return socket.query(
            'INSERT INTO `commands` (input, method, output, locked, prefix, count, created_at, updated_at) VALUES (?, NULL, ?, 0, ?, 0, NOW(), NOW())',
            [input, output, prefix],
        );
    },

    /**
     * Delete an IRC command.
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @returns {Promise}
     */
    delete(socket, id) {
        return socket.query(
            'UPDATE `commands` SET `deleted_at` = NOW() WHERE `id` = ?',
            [id],
        );
    },

    /**
     * Edits an IRC command.
     * @param {DatabaseManager} socket 
     * @param {string} property 
     * @param {number} id
     * @param  {string} [updated]
     * @returns {Promise}
     */
    edit(socket, property, id, updated) {
        switch (property) {
            case 'count':
                return socket.query(
                    'UPDATE `commands` SET `count` = count + 1 WHERE `id` = ?',
                    [id],
                  );
            case 'output':
                return socket.query(
                    'UPDATE `commands` SET `output` = ?, `updated_at` = NOW() WHERE `id` = ?',
                    [updated, id],
                  );
            case 'restriction':
                return socket.query(
                    'UPDATE `commands` SET `restriction` = ?, `updated_at` = NOW() WHERE `id` = ?',
                    [updated, id],
                  );
            case 'rename':
                return socket.query(
                    'UPDATE `commands` SET `input` = ?, `updated_at` = NOW() WHERE `id` = ?',
                    [updated, id],
                  );
            default:
        }
    },
}