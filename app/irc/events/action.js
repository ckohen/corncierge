'use strict';

module.exports = (socket, channel, user, message, self) => {
  if (self) return;
  socket.app.log.out('debug', module, JSON.stringify([channel, user.username, message]));
};
