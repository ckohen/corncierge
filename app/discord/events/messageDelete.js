'use strict';

module.exports = (socket, message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content.length > 900) {
        message.content = "**Too long to show!**";
    }
    socket.sendWebhook(
        'msgDelete',
        socket.getEmbed('messageRemove', [
            message, message.content,
        ]),
    );
};