'use strict';

const commands = {};

commands.help = require('./help');
commands.clear = require('./clear');
commands.reboot = require('./reboot');
commands.reload = require('./reload');
commands.status = require('./status');
commands.commands = require('./commands');
commands.makeme = require('./makeme');
commands.makemenot = require('./makemenot');
commands.setstatus = require('./setstatus');
commands.twitch = require('./twitch');
commands.color = require('./color');
commands.addwin = require('./addwin');
commands.setwins = require('./setwins');
commands.muteall = require('./muteall');
commands.unmuteall = require('./unmuteall');
commands.moveall = require('./moveall');
commands.rolemanager = require('./rolemanager');
commands.colormanager = require('./colormanager');
commands.prefix = require('./prefix');

function concat(obj, variable) {
    for(let key of Object.keys(obj)) {
        if(!variable[key]) variable[key] = {};
        for(let innerKey of Object.keys(obj[key])) variable[key][innerKey] = obj[key][innerKey];
    }
}

concat(require('./music'), commands);

module.exports = commands;
