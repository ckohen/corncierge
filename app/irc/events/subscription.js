'use strict';

const helpers = require.main.require('./app/util/helpers');

module.exports = (socket, channel, user) => {
  const alert = socket.app.settings.get('irc_message_sub');
  socket.say(channel, helpers.format(alert, { user }));
};
