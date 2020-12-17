'use strict';

module.exports = (socket, guild) => {
    socket.app.log.out('info', module, "Left server: " + guild.name)
    
    // Remove guild from role and color managers
    socket.app.database.delete('colorManager', [String(guild.id)]);
    socket.app.database.delete('roleManager', [String(guild.id)]);
    socket.app.database.delete('reactionRoles', [String(guild.id)]);
    socket.app.database.delete('voiceRoles', [String(guild.id)]);
    socket.app.database.delete('prefixes', [String(guild.id)]);
    socket.app.database.delete('randomChannels', [String(guild.id)]);
    socket.app.database.delete('newMemberRole', [String(guild.id)]);
    socket.app.database.delete('volumes', [String(guild.id)]);
};