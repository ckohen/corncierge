'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get all settings
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query('SELECT name, value FROM `settings`');
    },

    /**
     * Add a setting
     * @param {DatabaseManager} socket
     * @param {string} name
     * @param {string} value
     * @returns {Promise}
     */
    add(socket, name, value) {
        return socket.query(
            'INSERT INTO `settings` (name, value) VALUES (?, ?)',
            [name, value],
        );
    },

    /**
     * Edit a setting
     * @param {DatabaseManager} socket 
     * @param {string} name 
     * @param {string} value 
     * @returns {Promise}
     */
    edit(socket, name, value) {
        return socket.query(
            'UPDATE `settings` SET `value` = ? WHERE `name` = ?',
            [value, name],
        );
    },
}