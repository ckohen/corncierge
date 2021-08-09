'use strict';

const BaseCommand = require('../BaseCommand');

class LeaveCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'leave',
      aliases: ['end', 'fuckoff'],
      description: 'Leaves voice channel if in one',
      channel: 'music',
      role: 'DJ',
    };
    super(socket, info);
  }

  run(message) {
    const musicData = this.socket.cache.musicData.get(String(message.guildId));
    if (!musicData || musicData.subscription === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
    } else {
      musicData.subscription.voiceConnection.destroy();
      musicData.subscription.queue.length = 0;
      musicData.subscription = null;
    }
  }
}

module.exports = LeaveCommand;
