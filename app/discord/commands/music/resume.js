'use strict';

module.exports = {
  channel: 'music',
  name: 'resume',
  aliases: ['resume-song', 'continue'],
  description: 'Resume the current paused song',

  run(socket, message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    const musicData = socket.musicData.get(String(message.guild.id));
    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    message.channel.send('Song resumed :play_pause:');

    musicData.songDispatcher.resume();
  },
};
