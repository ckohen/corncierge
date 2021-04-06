'use strict';

const applicationCommands = [];

applicationCommands.push(require('./color'));
applicationCommands.push(require('./room'));
applicationCommands.push(require('./prediction'));
applicationCommands.push(require('./test'));

module.exports = applicationCommands;
