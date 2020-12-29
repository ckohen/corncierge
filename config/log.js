'use strict';

module.exports = {
  colors: {
    critical: 'bold white redBG',
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green',
    verbose: 'blue',
  },
  levels: {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    versbose: 5,
  },
  maxLevel: process.env.LOG_LEVEL || 'error',
  outputFile: process.env.LOG_LOCATION,
  webhookBase: 'https://discordapp.com/api/webhooks/',
  webhookLevels: {
    error: 'red',
    warn: 'gold',
  },
  webhookToken: process.env.LOG_WEBHOOK_TOKEN,
};
