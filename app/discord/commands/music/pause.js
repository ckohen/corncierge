module.exports = {
  channel: 'music',
      name: 'pause',
      aliases: ['pause-song', 'hold', 'stop'],
      description: 'Pause the current playing song',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    message.channel.send('Song paused :pause_button:');

    socket.musicData.songDispatcher.pause(true);
  }
};
