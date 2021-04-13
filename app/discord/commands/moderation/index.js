'use strict';

const moderationCommands = [];

moderationCommands.push(require('./clear'));
moderationCommands.push(require('./moveall'));
moderationCommands.push(require('./muteall'));
moderationCommands.push(require('./prefix'));
moderationCommands.push(require('./randommove'));
moderationCommands.push(require('./unmuteall'));

module.exports = moderationCommands;
