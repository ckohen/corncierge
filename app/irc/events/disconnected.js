'use strict';

module.exports = async (socket, reason) => {
  if (!socket.app.ending) {
    socket.app.log.warn(module, `Disconnected: ${reason}, attempting reconnect...`);
  }
  if (reason === 'Login authentication failed') {
    const newToken = await socket.app.auth.refreshToken(socket.app.options.irc.identity.username);
    socket.setDriver(newToken);
  }
};
