'use strict';

const oneMin = 60000;
const fiveMins = 300000;
const thirtySecs = 30000;

module.exports = {
  burst: 1,
  rate: 1,
  window: thirtySecs,
  overrides: {
    followage: { burst: 10, rate: 1, window: thirtySecs },
    joke: { burst: 1, rate: 1, window: fiveMins },
    uptime: { burst: 1, rate: 1, window: oneMin },
  },
};
