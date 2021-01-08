'use strict';

const util = require('../../util/UtilManager');

module.exports = (socket, channel, tags, message, filter) => {
  const { filterTypes } = socket;
  const { discord } = socket.app;

  let action = 'none';
  let duration = null;

  switch (filter.type) {
    // Ban
    case filterTypes.BAN:
      action = 'ban';
      socket.ban(channel, tags.username, () => {
        discord.sendWebhook('ban', discord.getContent('banAutomatic', [tags.username]), discord.getEmbed('message', [tags.username, message]));
      });
      break;
    // Timeout
    case filterTypes.TIMEOUT:
      action = 'timeout';
      ({ duration } = filter);
      socket.timeout(channel, tags.username, filter.duration, () => {
        discord.sendWebhook(
          'timeout',
          discord.getContent('timeoutAutomatic', [tags.username, util.humanDuration(filter.duration * 1000)]),
          discord.getEmbed('message', [tags.username, message]),
        );
      });
      break;
    // Delete
    case filterTypes.DELETE:
      action = 'delete';
      socket.delete(channel, tags.id, () => {
        discord.sendWebhook('delete', discord.getContent('deleteAutomatic', [tags.username]), discord.getEmbed('message', [tags.username, message]));
      });
      break;
    // Warning
    case filterTypes.WARNING:
      action = 'warning';
      if (!filter.output) break;
      socket.say(channel, `@${util.twitch.handle(tags)} ${filter.output}`);
      break;
    // Review
    case filterTypes.REVIEW:
      action = 'review';
      discord.sendWebhook('review', discord.getContent('review', [tags.username]), discord.getEmbed('message', [tags.username, message]));
      break;
    default:
      socket.app.log.warn(module, `Unknown moderation type: ${filter.type}`);
      break;
  }

  return { action, duration };
};
