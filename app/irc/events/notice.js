'use strict';

module.exports = (socket, channel, type, message) => {
  socket.app.log.out('debug', module, `Received notice: [${type}] ${message}`);
};
