'use strict';

module.exports = (socket, guild) => {
    socket.app.log.out('info', module, "Joined new server: " + guild.name)

    // Add new guild to role and color managers
    socket.app.database.addColorManager(String(guild.id));
    socket.app.database.addRoleManager(String(guild.id));
    socket.app.database.addPrefix(String(guild.id));

    // Send info message in system channel

    let infoChannel = getFirstSendable();
    let msg = socket.getEmbed("welcome", []);
    infoChannel.send(msg);

    function getFirstSendable() {
        return guild.channels.cache.filter(chan => chan.type === "text" && 
            chan.permissionsFor(guild.client.user).has(["SEND_MESSAGES", "VIEW_CHANNEL"]))
        .sort((a, b) => a.position - b.position)
        .first();
    }
};