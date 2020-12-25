'use strict';

module.exports = {
  channel: 'music',
  name: 'skipto',
  description: 'Skip to a specific song in the queue, provide the song number as an argument',
  role: 'DJ',
  args: true,
  usage: '<song number>',

  run(socket, message, args) {
    const songNumber = Number(args.join(' '));
    const musicData = socket.musicData.get(String(message.guild.id));
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
  },
};
