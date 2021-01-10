'use strict';

module.exports = socket => {
  if (!socket.app.ending) {
    setTimeout(() => {
      socket.driver.listen(socket.options.port).catch(err => {
        socket.app.log.error(module, `Listen: ${err}`);
      });
    }, 5000);
  }
};
