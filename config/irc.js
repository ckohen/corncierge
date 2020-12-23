'use strict';

module.exports = {
  channels: [`#${process.env.LISTEN_TWITCH_NAME}`],
  connection: {
    reconnect: true,
  },
  identity: {
    username: process.env.BOT_TWITCH_NAME,
  },
  options: {
    debug: false,
  },
};
