'use strict';

module.exports = (socket, reason) => {
  if (!socket.app.ending) {
    socket.app.log.warn(module, `Disconnected: ${reason}, attempting reconnect...`);
  }
};
