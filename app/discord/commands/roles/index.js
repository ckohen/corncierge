'use strict';

const roleCommands = [];

roleCommands.push(require('./autorole'));
roleCommands.push(require('./color'));
roleCommands.push(require('./colormanager'));
roleCommands.push(require('./makeme'));
roleCommands.push(require('./makemenot'));
roleCommands.push(require('./reactionroles'));
roleCommands.push(require('./rolemanager'));
roleCommands.push(require('./voiceroles'));

module.exports = roleCommands;
