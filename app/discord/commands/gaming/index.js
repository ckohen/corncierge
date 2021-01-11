'use strict';

const gamingCommands = [];

gamingCommands.push(require('./addwin'));
gamingCommands.push(require('./random'));
gamingCommands.push(require('./room'));
gamingCommands.push(require('./setwins'));

module.exports = gamingCommands;
