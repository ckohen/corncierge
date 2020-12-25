'use strict';

const tables = {};

tables.botLog = require('./botLog');
tables.colorManager = require('./colorManager');
tables.fallWins = require('./fallWins');
tables.humanLog = require('./humanLog');
tables.ircCommands = require('./ircCommands');
tables.ircFilters = require('./ircFilters');
tables.jokes = require('./jokes');
tables.newMemberRole = require('./newMemberRole');
tables.prefixes = require('./prefixes');
tables.randomChannels = require('./randomChannels');
tables.reactionRoles = require('./reactionRoles');
tables.roleManager = require('./roleManager');
tables.rooms = require('./rooms');
tables.settings = require('./settings');
tables.streaming = require('./streaming');
tables.voiceRoles = require('./voiceRoles');
tables.volumes = require('./volumes');

module.exports = tables;
