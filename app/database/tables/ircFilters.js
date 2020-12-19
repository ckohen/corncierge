'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Get all IRC moderation filters.
     * @param {DatabaseManager} socket
     * @returns {Promise}
     */
    get(socket) {
        return socket.query(
            'SELECT id, type, input, duration, output FROM `filters` WHERE `deleted_at` IS NULL ORDER BY `type` ASC',
        );
    },
}