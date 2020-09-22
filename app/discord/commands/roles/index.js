'use strict';

const commands = {};

commands.rolemanager = require('./rolemanager');
commands.colormanager = require('./colormanager');
commands.makeme = require('./makeme');
commands.makemenot = require('./makemenot');
commands.color = require('./color');

module.exports = commands;
