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
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    if (!musicData?.subscription?.isPlaying) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    if (songNumber < 1 || songNumber > musicData.subscription.queue.length + 1) {
      message.channel.send(`${message.member}, Please enter a valid song number`);
      return;
    }

    musicData.subscription.queue.splice(0, songNumber - 1);
    musicData.subscription.audioPlayer.stop();
  }
}

module.exports = SkipToCommand;
