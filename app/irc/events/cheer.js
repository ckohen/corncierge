'use strict';

const plural = require('pluralize');

const { format } = require.main.require('./app/util/helpers');

const twitch = require('../util');

module.exports = (socket, channel, tags) => {
  const alert = socket.app.settings.get('irc_message_cheer');
  const amount = plural('bit', Number(tags.bits), true);

  //socket.say(channel, format(alert, { amount, user: twitch.handle(tags) }));

  socket.app.log.out('debug', module, JSON.stringify(tags));
};
