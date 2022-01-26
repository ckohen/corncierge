'use strict';

module.exports = (socket, message) => {
  socket.app.log.verbose(module, message);
};
