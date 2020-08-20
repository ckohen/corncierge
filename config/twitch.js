'use strict';

module.exports = {
  bot: {
    id: process.env.BOT_TWITCH_ID,
    token: process.env.BOT_TWITCH_TOKEN,
  },
  channel: {
    id: process.env.LISTEN_TWITCH_ID,
    name: process.env.LISTEN_TWITCH_NAME,
    url: `https://twitch.tv/${process.env.LISTEN_TWITCH_NAME}`,
  },
  commandPrefix: '!',
};
