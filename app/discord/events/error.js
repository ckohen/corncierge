'use strict';

module.exports = (socket, error) => {
  let level = 'error';

  // Demote socket connection fluctuation warnings
  if (error.message.includes('ECONNRESET')) {
    level = 'info';
  }

  const message = error.message || JSON.stringify(error);

  socket.app.log[level](module, message);
};
