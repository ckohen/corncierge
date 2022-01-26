'use strict';
const { Message } = require('discord.js');
const cache = require('memory-cache');
const BaseRequest = require('../BaseRequest');

class StreamStartRequest extends BaseRequest {
  constructor(socket) {
    const info = {
      name: 'streamstart',
      methods: 'POST',
      description: 'handles stream starting requests from obs',
    };
    super(socket, info);
  }

  async run(method, url, headers) {
    const socket = this.socket;
    // Different handling for different users
    const user = headers.user;
    const testing = headers.test === 'true';

    // Ignore empty or default users
    if (!user || user === 'default') {
      return;
    }

    if (!socket.app.options.disableIRC && !testing) {
      let greeting;
      switch (user.toLowerCase()) {
        case socket.app.options.twitch?.channel?.name?.toLowerCase():
          greeting = socket.app.settings.get('irc_message_stream_up');
          socket.app.twitch.irc.say(user, greeting);
          break;
        default:
      }
    }

    if (socket.app.options.disableDiscord) return;
    // Get the annoucement channel defined for the user
    const channel = await socket.getChannel(user);
    if (!channel) {
      socket.app.log.debug(module, 'No channel');
      return;
    }

    const role = await socket.getRole(user, channel);
    if (!role) {
      socket.app.log.debug(module, 'No Role');
      return;
    }

    const twitchUser = await socket.app.twitch.driver.users.fetch({ logins: [user] });
    if (!twitchUser) return;
    const twitchChannel = await socket.app.twitch.driver.channels.fetch(twitchUser.id).catch(err => socket.app.log.warn(module, err));
    if (!twitchChannel) {
      return;
    }
    if (!twitchChannel.user.profileImageURL) {
      await twitchChannel.user.fetch().catch(err => socket.app.log.warn(module, err));
    }
    const followerData = await twitchChannel.user.fetchFollowers({ resultCount: 1 }).catch(err => socket.app.log.warn(module, err));
    const followerCount = followerData.total;
    const content = socket.app.discord.getContent('streamUp', [role, twitchChannel.user.displayName, `https://www.twitch.tv/${twitchChannel.name}`]);
    const embed = socket.app.discord.getEmbed('streamUp', [twitchChannel, followerCount]);
    // Check if throttled
    let msg;
    /* eslint-disable-next-line eqeqeq */
    if (cache.get(`video.stream.up.${user}`) != null) {
      msg = await socket.getMessage(user);
      if (msg && msg instanceof Message) {
        msg.edit({ content, embeds: [embed], allowedMentions: testing ? { parse: [] } : undefined });
      }
    } else {
      msg = await channel.send({ content, embeds: [embed], allowedMentions: testing ? { parse: [] } : undefined });
      if (msg.crosspostable) {
        msg.crosspost().catch(err => socket.app.log.warn(module, err));
      }
      socket.setMessage(user, msg.id);
      // Throttle additional events
      const fourHours = 14400000;
      cache.put(`video.stream.up.${user}`, 'trigger', fourHours);
    }
  }
}

module.exports = StreamStartRequest;
