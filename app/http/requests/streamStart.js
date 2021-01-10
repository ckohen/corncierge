'use strict';
const { Message } = require('discord.js');
const cache = require('memory-cache');

module.exports = async (socket, url, headers) => {
  // Different handling for different users
  let user = headers.user;

  // Ignore empty or default users
  if (!user || user === 'default') {
    return;
  }

  // Get the annoucement channel defined for the user
  let channel = await socket.getChannel(user);
  if (!channel) {
    socket.app.log.debug(module, 'No channel');
    return;
  }

  let greeting;
  switch (user) {
    case 'platicorn':
      greeting = socket.app.settings.get('irc_message_stream_up');
      socket.app.twitch.irc.say(user, greeting);
      break;
    default:
  }

  let role = await socket.getRole(user, channel);
  if (!role) {
    socket.app.log.debug(module, 'No Role');
    return;
  }

  const twitchChannel = await socket.app.twitch.userChannel(user).catch(err => socket.app.log.warn(module, err));
  if (!twitchChannel) {
    return;
  }
  let content = socket.app.discord.getContent('streamUp', [role, twitchChannel.display_name, twitchChannel.url]);
  let embed = socket.app.discord.getEmbed('streamUp', [twitchChannel]);
  // Check if throttled
  let msg;
  /* eslint-disable-next-line eqeqeq */
  if (cache.get(`video.stream.up.${user}`) != null) {
    msg = await socket.getMessage(user);
    if (msg && msg instanceof Message) {
      msg.edit(content, embed);
    }
  } else {
    msg = await channel.send(content, embed);
    if (msg.channel.type === 'news') {
      msg.crosspost().catch(err => socket.app.log.warn(module, err));
    }
    socket.setMessage(user, msg.id);
    // Throttle additional events
    const fourHours = 14400000;
    cache.put(`video.stream.up.${user}`, 'trigger', fourHours);
  }
};
