'use strict';

const authConfig = require('./auth');
const ircConfig = require('./irc');
const throttleConfig = require('./throttle');

module.exports = {
  apiConfig: {
    baseURL: 'https://api.twitch.tv/kraken/',
    headers: {
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': process.env.API_CLIENT_ID,
    },
  },
  auth: authConfig,
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
  irc: ircConfig,
  throttle: throttleConfig,
};
