'use strict';

module.exports = (socket, channel) => {
  socket.app.log.fatal('critical', module, `Server changed for channel ${channel}`);
};
