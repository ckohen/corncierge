'use strict';

const plural = require('pluralize');

const { format } = require.main.require('./app/util/helpers');

module.exports = (socket, channel, user, _, message, tags) => {
  if (!tags || !tags['msg-param-cumulative-months']) return;
  const alert = socket.app.settings.get('irc_message_resub');
  const months = tags['msg-param-cumulative-months'];
  const duration = plural('month', Number(months), true);
  socket.say(channel, format(alert, { duration, user }));
};
