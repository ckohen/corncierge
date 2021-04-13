'use strict';

const util = require('../../util/UtilManager');
const filterTypes = util.constants.IRCFilterTypes;

module.exports = (socket, channel, tags, message, filter) => {
  const { discord } = socket.app;

  let action = 'none';
  let duration = null;

  switch (filter.type) {
    // Ban
    case filterTypes.BAN:
      action = 'ban';
      socket.ban(channel, tags.username, () => {
        emitLog(action, 'banAutomatic', [tags.username], [tags.username, message]);
      });
      break;
    // Timeout
    case filterTypes.TIMEOUT:
      action = 'timeout';
      ({ duration } = filter);
      socket.timeout(channel, tags.username, filter.duration, () => {
        emitLog(action, 'timeoutAutomatic', [tags.username, util.humanDuration(filter.duration * 1000)], [tags.username, message]);
      });
      break;
    // Delete
    case filterTypes.DELETE:
      action = 'delete';
      socket.delete(channel, tags.id, () => {
        emitLog(action, 'deleteAutomatic', [tags.username], [tags.username, message]);
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
      emitLog(action, 'review', [tags.username], [tags.username, message]);
      break;
    default:
      socket.app.log.warn(module, `Unknown moderation type: ${filter.type}`);
      break;
  }

  function emitLog(act, contentType, contentArgs, embedArgs) {
    const content = discord.getContent(contentType, contentArgs);
    const embed = discord.getEmbed('message', embedArgs);
    /**
     * Emitted whenever an automatic moderation action on twitch occurs
     * @event EventLogger#twitchAutoMod
     * @param {string} action The action taken in this moderation event
     * @param {string} content The automatically generated content for this moderation event
     * @param {MessageEmbed} embed The automatically generated embed for this moderation event
     * @param {string} channel The irc channel name (including #) where this event occured
     * @param {Object} filter The filter that triggered this action
     */
    socket.app.eventLogger.emit('twitchAutoMod', act, content, embed, channel, filter);
  }

  return { action, duration };
};
