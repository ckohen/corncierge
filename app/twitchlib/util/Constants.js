'use strict';

const Package = require('../../../package.json');

exports.DefaultOptions = {
  auth: {},
  customAuth: false,
  rest: {},
  restType: 'standard',
};

exports.DefaultAuthOptions = {
  rest: {},
  restType: 'auth',
};

exports.DefaultAuthRestOptions = {
  api: 'http://id.twitch.tv/oauth2',
  headers: {},
  retries: 3,
  timeout: 15_000,
  userAgentAppendix: `Node.js ${process.version}`,
};

exports.DefaultRestOptions = {
  api: 'http://api.twitch.tv/helix',
  handlerSweepInterval: 14_400_000,
  headers: {},
  offset: 50,
  retries: 3,
  timeout: 15_000,
  userAgentAppendix: `Node.js ${process.version}`,
};

exports.DefaultUserAgent = `TwitchBot (${Package.homepage}, ${Package.version})`;
