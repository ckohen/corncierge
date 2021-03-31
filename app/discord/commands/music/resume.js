'use strict';

const BaseCommand = require('../BaseCommand');

class ResumeCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'resume',
      aliases: ['resume-song', 'continue'],
      description: 'Resume the current paused song',
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

    const musicData = this.socket.musicData.get(String(message.guild.id));
    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    message.channel.send('Song resumed :play_pause:');

    musicData.songDispatcher.resume();
  }
}

module.exports = ResumeCommand;
