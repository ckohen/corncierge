'use strict';

module.exports = (socket, guild) => {
    socket.app.log.out('info', module, "Left server: " + guild.name)
    
    // Remove guild from role and color managers
    socket.app.database.deleteColorManager(String(guild.id));
    socket.app.database.deleteRoleManager(String(guild.id));
};