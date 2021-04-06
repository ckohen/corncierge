'use strict';

const BaseCommand = require('../BaseCommand');

class SkipAllCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'skipall',
      aliases: ['skip-all', 'queue-clear', 'clearq', 'clear-q'],
      description: 'Skip all songs in queue',
      channel: 'music',
      role: 'DJ',
    };
    super(socket, info);
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send(`${message.member}, Join a channel and try again`);

    const musicData = this.socket.cache.musicData.get(String(message.guild.id));
    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      return message.channel.send(`${message.member}, There is no song playing right now!`);
    }
    if (!musicData.queue) {
      return message.channel.send(`${message.member}, There are no songs in queue`);
    }
    // Clear Queue
    musicData.queue.length = 0;
    return message.channel.send(`The queue has been cleared!`);
  }
}

module.exports = SkipAllCommand;
