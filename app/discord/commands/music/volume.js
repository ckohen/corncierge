module.exports = {
  channel: 'music',
      name: 'volume',
      aliases: ['change-volume'],
      description: 'Adjust song volume',
      role: 'DJ',
      usage: '[volume: 1-200]',

  async run(socket, message, args) {
    wantedVolume = Number(args[0]);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    if (wantedVolume <= 100 && wantedVolume >= 0) {
      const volume = wantedVolume / 100;
      socket.musicData.volume = volume;
      socket.musicData.songDispatcher.setVolume(volume);
      try {
        await socket.app.database.editSetting(`discord_music_volume`, volume);
      } catch (err) {
        socket.app.log.out('error', module, err);
      }
      message.channel.send(`I set the volume to: ${wantedVolume}%`);
    } else {
      message.reply(`The current volume is ${socket.musicData.volume * 100}%`)
    }
  }
};
