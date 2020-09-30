'use strict';

module.exports = async (socket, url, headers) => {
    // Different handling for different users
    let user = headers.user;

    // Ignore empty or default users
    if (!user || user == "default") {
        return;
    }

    // Get the annoucement channel defined for the user
    let channel = await socket.getChannel(user);
    if (!channel) {
        console.log("No channel");
        return;
    }

    switch (user) {
        case "platicorn":
            const greeting = socket.app.settings.get('irc_message_stream_up');
            socket.app.irc.say(user, greeting);
        break;
        default:
            ;
    }

    let role = await socket.getRole(user, channel);
    if (!role) {
        console.log("No Role");
        return;
    }

    socket.app.api.userChannel(user, async (twitch) => {
        if (!twitch) {
            return;
        }
        let content = socket.app.discord.getContent('streamUp', [role, twitch.display_name, twitch.url]);
        let embed = socket.app.discord.getEmbed('streamUp', [twitch]);
        let msg = await channel.send(content, embed);
        socket.setMessage(user, msg.id);
    });
};