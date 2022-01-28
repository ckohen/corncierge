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
    const stream = await this.socket.twitch.driver.streams.fetch(handler.channel.id).catch(err => this.socket.app.log.verbose(module, err));
    if (!stream?.startedTimestamp) return false;
    handler.respond(util.constants.IRCResponders.uptime(util.relativeTime(stream.startedTimestamp, 3)));
    return true;
  }
}

module.exports = UptimeTwitchCommand;
