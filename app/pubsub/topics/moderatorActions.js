'use strict';

const { humanDuration } = require.main.require('./app/util/helpers');

module.exports = (socket, payload) => {
  const { data } = payload;

  if (data.type !== 'chat_login_moderation') {
    socket.app.log.out('info', module, `Unknown payload type: ${data.type}`);
    return;
  }

  const moderator = data.created_by;
  const chatter = data.args ? data.args[0] : data.target_user_id;

  if (moderator.toLowerCase() === socket.app.options.irc.identity.username) return;

  let lastChatter;
  let reason = null;
  let message = null;
  let duration = null;

  switch (data.moderation_action) {
    // Ban
    case 'ban':
      reason = data.args[1] || null;

      socket.app.discord.sendWebhook(
        'ban',
        socket.app.discord.getContent('ban', [
          chatter, moderator, reason ? `(${reason})` : '',
        ]),
      );

      break;
    // Timeout
    case 'timeout':
      duration = data.args[1] || null;
      reason = data.args[2] || null;

      if (!duration || duration < 60 || chatter === lastChatter) break;

      lastChatter = chatter;

      socket.app.discord.sendWebhook(
        'timeout',
        socket.app.discord.getContent('timeout', [
          chatter, moderator, humanDuration(duration * 1000), reason ? `(${reason})` : '',
        ]),
      );

      break;
    // Delete
    case 'delete':
      message = data.args[1] || null;

      socket.app.discord.sendWebhook(
        'delete',
        socket.app.discord.getContent('delete', [chatter, moderator]),
        socket.app.discord.getEmbed('message', [chatter, message || '']),
      );

      break;
    // Unban
    case 'unban':
    case 'untimeout':
      socket.app.discord.sendWebhook(
        'unban',
        socket.app.discord.getContent('unban', [chatter, moderator]),
      );

      break;
    // Other
    case 'mod':
    case 'automod_rejected':
    case 'denied_automod_message':
      break;
    default:
      socket.app.log.out('info', module, `Unknown moderator action: ${data.moderation_action}`);
      break;
  }

  socket.app.log.out('debug', module, JSON.stringify(payload));

  socket.app.database.addHumanLog(
    data.moderation_action,
    chatter, data.target_user_id,
    moderator, data.created_by_user_id,
    duration, reason, message,
  );
};
