'use strict';

const musicCommands = [];

musicCommands.push(require('./leave'));
musicCommands.push(require('./loop'));
musicCommands.push(require('./nowplaying'));
musicCommands.push(require('./pause'));
musicCommands.push(require('./play'));
musicCommands.push(require('./queue'));
musicCommands.push(require('./remove'));
musicCommands.push(require('./resume'));
musicCommands.push(require('./shuffle'));
musicCommands.push(require('./skip'));
musicCommands.push(require('./skipall'));
musicCommands.push(require('./skipto'));
musicCommands.push(require('./volume'));

module.exports = musicCommands;
