'use strict';

const commands = {};

commands.clear = require('./clear');
commands.muteall = require('./muteall');
commands.unmuteall = require('./unmuteall');
commands.moveall = require('./moveall');
commands.prefix = require('./prefix');
commands.randommove = require('./randommove');

module.exports = commands;
