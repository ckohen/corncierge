'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get all Fall Guys Win data.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT id, count FROM `fallwins`');
    },

    /**
     * Add a Fall Guys Win counter
     * @param {DatabaseManager} socket
     * @param {string} id
     * @param {number} count
     * @returns {Promise}
     */
    add(socket, id, count) {
        return socket.query(
            'INSERT INTO `fallwins` (id, count) VALUES (?, ?)',
            [id, count],
        );
    },

    /**
     * Edit Fall Guys Wins
     * @param {DatabaseManager} socket 
     * @param {string} id 
     * @param {number} wins
     * @returns {Promise}
     */
    edit(socket, id, wins) {
        return socket.query(
            'UPDATE `fallwins` SET `count` = ? WHERE `id` = ?',
            [wins, id],
        );
    },
}