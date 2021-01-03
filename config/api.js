'use strict';

module.exports = {
  config: {
    baseURL: 'https://api.twitch.tv/kraken/',
    headers: {
      Accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': process.env.API_CLIENT_ID,
    },
  },
  token: process.env.API_TOKEN,
};
