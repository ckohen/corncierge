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

    let twitchStream = await socket.app.twitch.fetchStream({ userName: user }).then(
      data => data?.data?.[0],
      err => socket.app.log.warn(module, err),
    );
    const twitchUser = await socket.app.twitch.fetchUser({ userName: user }).catch(err => socket.app.log.warn(module, err));
    const duration = twitchStream?.started_at ? `for ${util.relativeTime(new Date(twitchStream.started_at).getTime(), 3)}` : '';
    const msg = await socket.getMessage(user);
    if (!twitchStream) {
      twitchStream = {
        user_name: msg?.embeds?.[0]?.author?.name,
        user_login: msg?.embeds?.[0]?.author?.name?.toLowerCase(),
        game_name: msg?.embeds?.[0]?.fields?.[0]?.value,
      };
    }
    const content = socket.app.discord.getContent('streamDown', [twitchStream.user_name]);
    const embed = socket.app.discord.getEmbed('streamDown', [twitchStream, twitchUser, duration]);
    if (msg && msg instanceof Message) {
      msg.edit({ content, embeds: [embed], allowedMentions: testing ? { parse: [] } : undefined });
    }

    cache.del(`stream.uptime.${user}`);

    // Throttle additional events
    const tenSec = 10000;
    cache.put(`video.stream.down.${user}`, 'trigger', tenSec);
  }
}

module.exports = StreamStopRequest;
