'use strict';

const events = {};

events.open = require('./open');
events.close = require('./close');
events.message = require('./message');

module.exports = events;
