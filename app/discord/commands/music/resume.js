module.exports = {
  channel: 'music',
  name: 'resume',
  aliases: ['resume-song', 'continue'],
  description: 'Resume the current paused song',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher === null
    ) {
      return message.reply('There is no song playing right now!');
    }

    message.channel.send('Song resumed :play_pause:');

    socket.musicData.songDispatcher.resume();
  }
};
