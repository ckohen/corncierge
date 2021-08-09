'use strict';

const BaseCommand = require('../BaseCommand');

class PauseCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'pause',
      aliases: ['pause-song', 'hold', 'stop'],
      description: 'Pause the current playing song',
      channel: 'music',
    };
    super(socket, info);
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }
    const musicData = this.socket.cache.musicData.get(String(message.guildId));

    if (!musicData?.subscription?.isPlaying) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    musicData.subscription.audioPlayer.pause(true);
    message.channel.send('Song paused :pause_button:');
  }
}

module.exports = PauseCommand;
