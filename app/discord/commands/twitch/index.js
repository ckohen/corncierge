'use strict';

const twitchCommands = [];

twitchCommands.push(require('./commandlist'));
twitchCommands.push(require('./commands'));
twitchCommands.push(require('./variables'));

module.exports = twitchCommands;
