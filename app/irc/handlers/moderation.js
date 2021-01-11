'use strict';

const util = require('../../util/UtilManager');
const filterTypes = util.constants.IRCFilterTypes;

module.exports = (socket, channel, tags, message, filter) => {
  const { discord } = socket.app;
  const externalLog = !socket.app.options.disableDiscord;

  let action = 'none';
  let duration = null;

  switch (filter.type) {
    // Ban
    case filterTypes.BAN:
      action = 'ban';
      socket.ban(channel, tags.username, () => {
        webhookLog(discord, externalLog, 'userBan', 'banAutomatic', [tags.username], [tags.username, message]);
      });
      break;
    // Timeout
    case filterTypes.TIMEOUT:
      action = 'timeout';
      ({ duration } = filter);
      socket.timeout(channel, tags.username, filter.duration, () => {
        webhookLog(discord, externalLog, 'twitch', 'timeoutAutomatic', [tags.username, util.humanDuration(filter.duration * 1000)], [tags.username, message]);
      });
      break;
    // Delete
    case filterTypes.DELETE:
      action = 'delete';
      socket.delete(channel, tags.id, () => {
        webhookLog(discord, externalLog, 'twitch', 'deleteAutomatic', [tags.username], [tags.username, message]);
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
      webhookLog(discord, externalLog, 'twitch', 'review', [tags.username], [tags.username, message]);
      break;
    default:
      socket.app.log.warn(module, `Unknown moderation type: ${filter.type}`);
      break;
  }

  return { action, duration };
};

function webhookLog(discord, enabled, webhook, contentType, contentArgs, embedArgs) {
  if (enabled) {
    discord.sendWebhook(webhook, discord.getContent(contentType, contentArgs), discord.getEmbed('message', embedArgs));
  }
}
