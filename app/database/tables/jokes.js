'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get all jokes.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query(
            'SELECT id, output FROM `jokes` WHERE `deleted_at` IS NULL ORDER BY RAND()',
        );
    },
}