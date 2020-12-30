'use strict';

module.exports = (socket, channel, user, message, self) => {
  if (self) return;
  socket.app.log.verbose(module, JSON.stringify([channel, user.username, message]));
};
