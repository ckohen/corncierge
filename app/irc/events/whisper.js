'use strict';

const twitch = require('../util');

module.exports = (socket, from, user, message) => {
  const handle = twitch.handle(user);

  socket.app.discord.sendMessage('whispers', socket.app.discord.getEmbed('whisper', [handle, message]));

  socket.app.log.out('debug', module, `Received whisper from ${handle}: ${message}`);
};
