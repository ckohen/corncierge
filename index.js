/*
 * Corncierge
 */

'use strict';

// Environment
require('dotenv').config();

// Run
let corncierge = require('./app').default;

const oneMin = 60000;
const fiveMins = 300000;
const thirtySecs = 30000;
// Configuration
const config = {
  debug: process.env.APP_DEBUG === 'true',
  database: {
    database: process.env.DATABASE_DATABASE,
    host: process.env.DATABASE_HOST,
  },
  http: {
    port: Number(process.env.HTTP_PORT),
    useHttps: process.env.USE_HTTPS === 'true',
    httpsOptions: {
      certLocation: process.env.HTTPS_CERT,
      keyLocation: process.env.HTTPS_KEY,
    },
  },
  log: {
    maxLevel: process.env.LOG_LEVEL,
    verbose: process.env.LOG_VERBOSE === 'true',
    outputFile: process.env.LOG_LOCATION,
  },
  twitch: {
    channel: {
      id: Number(process.env.LISTEN_TWITCH_ID),
      name: process.env.LISTEN_TWITCH_NAME,
    },
    irc: {
      botId: Number(process.env.BOT_TWITCH_ID),
      channels: [`#${process.env.LISTEN_TWITCH_NAME}`],
      identity: {
        username: process.env.BOT_TWITCH_NAME,
      },
    },
    ircThrottle: {
      overrides: {
        followage: { burst: 10, rate: 1, window: thirtySecs },
        joke: { burst: 1, rate: 1, window: fiveMins },
        uptime: { burst: 1, rate: 1, window: oneMin },
      },
    },
    redirectUri: 'htttp://localhost',
  },
};

const app = corncierge(config);

app.log('#', 'Starting...');

app.boot();
