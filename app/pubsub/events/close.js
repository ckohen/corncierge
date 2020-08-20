'use strict';

module.exports = (socket) => {
  socket.app.log.fatal('critical', module, 'Disconnected');
};
