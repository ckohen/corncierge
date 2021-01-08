'use strict';

const plural = require('pluralize');
const util = require('../../util/UtilManager');

module.exports = (socket, channel, tags) => {
  const alert = socket.app.settings.get('irc_message_cheer');
  const amount = plural('bit', Number(tags.bits), true);

  socket.say(channel, util.format(alert, { amount, user: util.twitch.handle(tags) }));

  socket.app.log.verbose(module, JSON.stringify(tags));
};
