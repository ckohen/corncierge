'use strict';

const helpers = require.main.require('./app/util/helpers');

module.exports = (socket) => {
  socket.driver.send(JSON.stringify({
    type: 'LISTEN',
    nonce: socket.nonce,
    data: {
      topics: socket.topics.map((t) => t.topic),
      auth_token: socket.app.options.twitch.bot.token,
    },
  }), (err) => {
    if (!err) return;
    socket.app.log.fatal('error', module, `Open: ${err}`);
  });

  const fiveSecs = 5000;
  const thirtySecs = 30000;
  const threeMins = 180000;

  helpers.variableInterval(() => {
    socket.driver.send(JSON.stringify({
      type: 'PING',
    }), (err) => {
      if (!err) return;
      socket.app.log.fatal('error', module, `Ping: ${err}`);
    });
  }, () => threeMins + helpers.jitter(fiveSecs, thirtySecs));
};
