const twitch = require('../util')
const handlers = require ('../handlers');

module.exports = (socket, channel, user, messageRaw, self) => {
    // Ignore self
    if (self) return;

    const message = messageRaw.trim();
    const opts = socket.app.options.twitch;
    const isPrivileged = twitch.isPrivileged(user, opts.channel);

    const filter = socket.filters.find((item) => new RegExp(item.input, 'gi').test(message));

    if (filter && !isPrivileged) {
        // Handle moderation
        const { action, duration } = handlers.moderation(socket, channel, user, message, filter);

        // Log moderation
        socket.logModeration(filter.id, action, user.username, user['user-id'], duration, message);

        return;
    }
};