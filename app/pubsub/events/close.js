'use strict';

module.exports = async (socket) => {
  if (!socket.app.ending) {
    socket.app.log.out('warn', module, 'Disconnected, waiting 30 seconds before reconnect...');
    try {
      await socket.driver.close();
    }
    catch {
      ;
    }
    setTimeout(function () { socket.init(); }, 30000);
  }
};
