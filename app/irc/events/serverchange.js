'use strict';

module.exports = (socket, channel) => {
  socket.app.log.fatal(module, `Server changed for channel ${channel}`);
};
