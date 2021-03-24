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
    const testing = headers.test;
    if (cache.get(`video.stream.down.${user}`) !== null) return;

    // Ignore empty or default users
    if (!user || user === 'default') {
      return;
    }

    if (!socket.app.options.disableIRC && !testing) {
      let farewell;
      switch (user) {
        case 'platicorn':
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

    const uptime = await socket.app.twitch.fetchUptime(user).catch(err => socket.app.log.warn(module, err));
    const duration = uptime ? `for ${util.relativeTime(uptime, 3)}` : '';

    const twitchChannel = await socket.app.twitch.userChannel(user).catch(err => socket.app.log.warn(module, err));
    if (!twitchChannel) {
      return;
    }
    const content = socket.app.discord.getContent('streamDown', [twitchChannel.display_name]);
    const embed = socket.app.discord.getEmbed('streamDown', [twitchChannel, twitchChannel.game, duration]);
    const msg = await socket.getMessage(user);
    if (msg && msg instanceof Message) {
      msg.edit(content, { embed, allowedMentions: testing ? { parse: [] } : undefined });
    }

    cache.del(`stream.uptime.${user}`);

    // Throttle additional events
    const tenSec = 10000;
    cache.put(`video.stream.down.${user}`, 'trigger', tenSec);
  }
}

module.exports = StreamStopRequest;
