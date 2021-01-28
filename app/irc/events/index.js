'use strict';

const events = {};

events.chat = require('./chat');
events.cheer = require('./cheer');
events.resub = require('./resub');
events.action = require('./action');
events.notice = require('./notice');
events.whisper = require('./whisper');
events.connected = require('./connected');
events.disconnected = require('./disconnected');
events.serverchange = require('./serverchange');
events.subscription = require('./subscription');
events.redeem = require('./redeem');

module.exports = events;
