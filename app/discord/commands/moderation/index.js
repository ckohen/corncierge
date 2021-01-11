'use strict';

const moderationCommands = [];

moderationCommands.push(require('./clear'));
moderationCommands.push(require('./jumbo'));
moderationCommands.push(require('./moveall'));
moderationCommands.push(require('./muteall'));
moderationCommands.push(require('./nuke'));
moderationCommands.push(require('./prefix'));
moderationCommands.push(require('./randommove'));
moderationCommands.push(require('./unmuteall'));

module.exports = moderationCommands;
