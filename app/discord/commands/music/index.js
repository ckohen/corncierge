'use strict';

const commands = {};

commands.leave = require('./leave');
commands.loop = require('./loop');
commands.nowplaying = require('./nowplaying');
commands.pause = require('./pause');
commands.play = require('./play');
commands.queue = require('./queue');
commands.remove = require('./remove');
commands.resume = require('./resume');
commands.shuffle = require('./shuffle');
commands.skip = require('./skip');
commands.skipall = require('./skipall');
commands.skipto = require('./skipto');
commands.volume = require('./volume');

module.exports = commands;
