'use strict';

const Package = require('../../../package.json');

exports.DefaultRestOptions = {
  api: 'http://api.twitch.tv/helix',
  headers: {},
  offset: 50,
  retries: 3,
  timeout: 15_000,
  userAgentAppendix: `Node.js ${process.version}`,
};

exports.DefaultUserAgent = `TwitchBot (${Package.homepage}, ${Package.version})`;
