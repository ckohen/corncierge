'use strict';

module.exports = (socket, reason) => {
  socket.app.log.fatal('critical', module, `Disconnected: ${reason}`);
};
