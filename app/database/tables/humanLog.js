'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Add a human-initiated log entry.
     * @param {DatabaseManager} socket
     * @param {...*} values
     */
    add(socket, ...values) {
        socket.query(
            'INSERT INTO `log_human` (action, user, user_id, moderator, moderator_id, duration, reason, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            values,
        ).catch((err) => this.app.log.out('warn', module, err));
    },
}