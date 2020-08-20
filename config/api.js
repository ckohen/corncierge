'use strict';

module.exports = {
  baseUrl: 'https://api.twitch.tv/kraken/',
  client: process.env.API_CLIENT_ID,
  token: process.env.API_TOKEN,
  mime: 'application/vnd.twitchtv.v5+json',
};
