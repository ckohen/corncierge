'use strict';

module.exports = {
  channel: 'music',
  name: 'remove',
  description: 'Remove a specific song from queue',
  args: true,
  role: 'DJ',
  usage: '<song number to delete>',

  run(socket, message, args) {
    const songNumber = Number(args.join(' '));
    const musicData = socket.musicData.get(String(message.guild.id));
    if (songNumber < 1 || songNumber >= musicData.queue.length) {
      return message.channel.send(`${message.member}, Please enter a valid song number`);
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send(`${message.member}, Join a channel and try again`);

    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      return message.channel.send(`${message.member}, There is no song playing right now!`);
    }

    musicData.queue.splice(songNumber - 1, 1);
    return message.channel.send(`Removed song number ${songNumber} from queue`);
  },
};
