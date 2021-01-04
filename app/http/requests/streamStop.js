'use strict';
const { Message } = require('discord.js');
const cache = require('memory-cache');
const helpers = require('../../util/helpers');

module.exports = async (socket, url, headers) => {
  // Different handling for different users
  let user = headers.user;
  if (cache.get(`video.stream.down.${user}`) !== null) return;

  // Ignore empty or default users
  if (!user || user === 'default') {
    return;
  }

  // Get the annoucement channel defined for the user
  let channel = await socket.getChannel(user);
  if (!channel) {
    return;
  }

  let farewell;
  switch (user) {
    case 'platicorn':
      farewell = socket.app.settings.get('irc_message_stream_down');
      socket.app.twitch.irc.say(user, farewell);
      break;
    default:
  }

  let role = await socket.getRole(user, channel);
  if (!role) {
    return;
  }

  const uptime = socket.app.twitch.fetchUptime(user).catch(err => socket.app.log.warn(err));
  const duration = uptime ? `for ${helpers.relativeTime(uptime, 3)}` : '';

  const twitchChannel = socket.app.twitch.userChannel(user).catch(err => socket.app.log.warn(module, err));
  if (!twitchChannel) {
    return;
  }
  let content = socket.app.discord.getContent('streamDown', [twitchChannel.display_name]);
  let embed = socket.app.discord.getEmbed('streamDown', [twitchChannel, twitchChannel.game, duration]);
  let msg = await socket.getMessage(user);
  if (msg && msg instanceof Message) {
    msg.edit(content, embed);
  }

  cache.del(`stream.uptime.${user}`);

  // Throttle additional events
  const tenSec = 10000;
  cache.put(`video.stream.down.${user}`, 'trigger', tenSec);
};
