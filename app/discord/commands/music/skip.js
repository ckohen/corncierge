'use strict';

module.exports = {
  channel: 'music',
  name: 'skip',
  aliases: ['skip-song', 'advance-song'],
  description: 'Skip the current playing song',
  role: 'DJ',

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
    musicData.songDispatcher.end();
  },
};
