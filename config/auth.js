'use strict';

module.exports = {
  redirectUri: 'http://localhost',
  config: {
    baseURL: 'https://id.twitch.tv/oauth2/',
  },
  clientID: process.env.API_CLIENT_ID,
  clientSecret: process.env.API_CLIENT_SECRET,
  botCode: process.env.BOT_TWITCH_CODE,
};
