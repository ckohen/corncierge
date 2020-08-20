'use strict';

module.exports = (socket, event) => {
  const response = JSON.parse(event);

  if (typeof response.error === 'string' && response.error.length > 0) {
    socket.app.log.fatal('error', module, `Error: ${response.error}`);
    return;
  }

  if (typeof response.nonce === 'string' && response.nonce !== socket.nonce) {
    socket.app.log.out('warn', module, 'Nonce does not match');
    return;
  }

  switch (response.type) {
    case 'RESPONSE':
      socket.app.log.out('info', module, `Response: ${response.nonce}`);
      break;
    case 'PONG':
      break;
    case 'MESSAGE':
      socket.topic(response.data.topic, response.data.message);
      break;
    case 'RECONNECT':
      socket.app.log.fatal('critical', module, 'Reconnect instruct received');
      break;
    default:
      socket.app.log.out('warn', module, `Unknown message type: ${response.type}`);
      break;
  }
};
