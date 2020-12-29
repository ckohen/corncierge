'use strict';

module.exports = (socket, address) => {
  socket.app.log(module, `Connected to IRC (${address})`);
};
