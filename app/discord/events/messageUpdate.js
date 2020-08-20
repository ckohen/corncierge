'use strict';

module.exports = (socket, before, after) => {
    if (before.content === after.content) {
        return;
    }

    if (before.content.length > 900) {
        before.content = "**Too long to show!**";
    }
    if (after.content.length > 400) {
        after.content = "**Too long to show!**";
    }
    socket.sendWebhook(
        'msgEdit',
        socket.getEmbed('messageEdit', [
            after, before.content, after.content,
        ]),
    );
};