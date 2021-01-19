'use strict';

const TwitchCommand = require('./TwitchCommand');
const util = require('../../util/UtilManager');

class UptimeTwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'uptime',
    };
    super(socket, info);
  }

  async run(handler) {
    const uptime = await this.socket.twitch.fetchUptime(handler.channel.name).catch(err => this.socket.app.log.verbose(err));
    if (!uptime) return Promise.resolve(false);
    handler.respond(util.constants.IRCResponders.uptime(util.relativeTime(uptime, 3)));
    return Promise.resolve(true);
  }
}

module.exports = UptimeTwitchCommand;
