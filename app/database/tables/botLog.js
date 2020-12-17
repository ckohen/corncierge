'use strict';

const DatabaseManager = require("../DatabaseManager");

module.exports = {
    /**
     * Add a bot-initiated log entry.
     * @param {DatabaseManager} socket
     * @param {...*} values
     */
    add(socket, ...values) {
        socket.query(
            'INSERT INTO `log_bot` (filter_id, action, user, user_id, duration, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            values,
        ).catch((err) => this.app.log.out('warn', module, err));
    },
}