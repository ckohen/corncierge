'use strict';

const BaseCommand = require('../BaseCommand');

class SkipToCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'skipto',
      description: 'Skip to a specific song in the queue, provide the song number as an argument',
      usage: '<song number>',
      channel: 'music',
      role: 'DJ',
      args: true,
    };
    super(socket, info);
  }

  run(message, args) {
    const songNumber = Number(args.join(' '));
    const musicData = this.socket.cache.musicData.get(String(message.guildId));
    if (songNumber < 1 || songNumber > musicData.queue.length + 1) {
      message.channel.send(`${message.member}, Please enter a valid song number`);
      return;
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    if (musicData.queue < 1) {
      message.channel.send(`${message.member}, There are no songs in queue`);
      return;
    }

    musicData.queue.splice(0, songNumber - 1);
    musicData.songDispatcher.end();
  }
}

module.exports = SkipToCommand;
