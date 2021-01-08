'use strict';

const { format } = require('../../util/UtilManager');

module.exports = (socket, channel, user) => {
  const alert = socket.app.settings.get('irc_message_sub');
  socket.say(channel, format(alert, { user }));
};
