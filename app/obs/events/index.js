'use strict';

const events = {};

events.ConnectionOpened = require('./ConnectionOpened');
events.ConnectionClosed = require('./ConnectionClosed');
events.StreamStarted = require('./streamStart');
events.StreamStopped = require('./streamStop');
events.error = require('./error');

module.exports = events;
