'use strict';

const managementCommands = [];

managementCommands.push(require('./eval'));
managementCommands.push(require('./reboot'));
managementCommands.push(require('./reload'));
managementCommands.push(require('./setstatus'));
managementCommands.push(require('./status'));
managementCommands.push(require('./update'));

module.exports = managementCommands;
