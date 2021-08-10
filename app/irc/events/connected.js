'use strict';

module.exports = (socket, address) => {
  socket.app.log.status(module, `Connected to IRC (${address})`);
};
