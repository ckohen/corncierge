'use strict';

module.exports = socket => {
  if (!socket.app.ending) {
    setTimeout(() => {
      socket.driver.listen(socket.options.port);
    }, 5000);
  }
};
