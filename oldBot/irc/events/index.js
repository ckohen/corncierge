const events = {};

events.chat = require('./chat');
events.action = require('./action');
events.whisper = require('./whisper');
module.exports = events;