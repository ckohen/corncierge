'use strict';

module.exports = (socket, guild) => {
    socket.app.log.out('info', module, "Joined new server: " + guild.name)

    // Add new guild to role and color managers
    socket.app.database.addColorManager(String(guild.id));
    socket.app.database.addRoleManager(String(guild.id));

    // Send info message in system channel
};