'use strict';

const handlers = {};

handlers.command = require('./command');
handlers.moderation = require('./moderation');

module.exports = handlers;
