'use strict';
const { Message } = require('discord.js');
const cache = require('memory-cache');
const util = require('../../../util/UtilManager');
const BaseRequest = require('../BaseRequest');

class StreamStopRequest extends BaseRequest {
  constructor(socket) {
    const info = {
      name: 'streamstop',
      methods: 'POST',
      description: 'handles stream stop requests from obs',
    };
    super(socket, info);
  }

  async run(method, url, headers) {
    const socket = this.socket;
    // Different handling for different users
    const user = headers.user;
    const testing = headers.test === 'true';
    if (cache.get(`video.stream.down.${user}`) !== null) return;

    // Ignore empty or default users
    if (!user || user === 'default') {
      return;
    }

    if (!socket.app.options.disableIRC && !testing) {
      let farewell;
      switch (user.toLowerCase()) {
        case socket.app.options.twitch?.channel?.name?.toLowerCase():
          farewell = socket.app.settings.get('irc_message_stream_down');
          socket.app.twitch.irc.say(user, farewell);
          break;
        default:
      }
    }

    if (socket.app.options.disableDiscord) return;

    // Get the annoucement channel defined for the user
    const channel = await socket.getChannel(user);
    if (!channel) {
      return;
    }

    const role = await socket.getRole(user, channel);
    if (!role) {
      return;
    }

    const twitchStream = await socket.app.twitch.driver.streams.fetch({ userLogins: [user], resultCount: 1 }).catch(err => socket.app.log.warn(module, err));
    const twitchUser = await socket.app.twitch.drvier.users.fetch({ logins: [user] }).catch(err => socket.app.log.warn(module, err));
    const duration = twitchStream?.startedTimestamp ? `for ${util.relativeTime(twitchStream.startedTimestamp, 3)}` : '';
    const msg = await socket.getMessage(user);
    const content = socket.app.discord.getContent('streamDown', [twitchUser.displayName]);
    const embed = socket.app.discord.getEmbed('streamDown', [
      twitchStream?.channel?.category?.name ?? msg?.embeds?.[0]?.fields?.[0]?.value,
      twitchUser,
      duration,
    ]);
    if (msg && msg instanceof Message) {
      msg.edit({ content, embeds: [embed], allowedMentions: testing ? { parse: [] } : undefined });
    }

    // Throttle additional events
    const tenSec = 10000;
    cache.put(`video.stream.down.${user}`, 'trigger', tenSec);
  }
}

module.exports = StreamStopRequest;
