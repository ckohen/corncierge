'use strict';

const config = {};

config.app = require('./app');
config.log = require('./log');
config.twitch = require('./twitch');
config.discord = require('./discord');
config.database = require('./database');
config.youtube = require('./youtube');
config.http = require('./http');

module.exports = config;
