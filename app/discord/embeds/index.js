'use strict';

const embeds = {};

embeds.message = require('./message');
embeds.whisper = require('./streaming/whisper');
embeds.streamUp = require('./streaming/streamUp');
embeds.memberAdd = require('./users/memberAdd');
embeds.streamDown = require('./streaming/streamDown');
embeds.memberRemove = require('./users/memberRemove');
embeds.userChange = require('./users/userChange');
embeds.roleChange = require('./roles/roleChange');
embeds.userBanChange = require('./users/userBanChange');
embeds.messageEdit = require('./messageEdit');
embeds.messageRemove = require('./messageRemove');
embeds.rolemanager = require('./roles/rolemanager');
embeds.colormanager = require('./roles/colormanager');
embeds.welcome = require('./welcome');
embeds.help = require('./help');
embeds.rooms = require('./gaming/rooms');
embeds.reactionRoles = require('./roles/reactionRoles');
embeds.update = require('./update');
embeds.voiceRoles = require('./roles/voiceRoles');

module.exports = embeds;
