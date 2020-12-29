'use strict';

module.exports = (socket, channel, type, message) => {
  socket.app.log.debug(module, `Received notice: [${type}] ${message}`);
};
