'use strict';

const commands = {};

commands.joke = require('./joke');
commands.uptime = require('./uptime');
commands.followage = require('./followage');

module.exports = commands;
