'use strict';

module.exports = (socket, address) => {
  socket.app.log.out('info', module, `Connected to IRC (${address})`);
};
