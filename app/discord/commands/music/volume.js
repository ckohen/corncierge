'use strict';

module.exports = {
  channel: 'music',
  name: 'volume',
  aliases: ['change-volume'],
  description: 'Adjust song volume',
  role: 'DJ',
  usage: '[volume: 1-200]',

  run(socket, message, args) {
    const wantedVolume = Number(args[0]);
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
    if (wantedVolume <= 100 && wantedVolume >= 0) {
      const volume = wantedVolume / 100;
      musicData.volume = volume;
      musicData.songDispatcher.setVolume(volume);
      try {
        socket.app.database.edit('volumes', [String(message.guild.id), volume]);
      } catch (err) {
        socket.app.log.out('error', module, err);
      }
      message.channel.send(`I set the volume to: ${wantedVolume}%`);
    } else {
      message.reply(`The current volume is ${musicData.volume * 100}%`);
    }
  },
};
