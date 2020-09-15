module.exports = {
  channel: 'music',
  name: 'leave',
  aliases: ['end'],
  description: 'Leaves voice channel if in one',
  role: 'DJ',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply('Join a channel and try again');
      return;
    } else if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      message.reply('There is no song playing right now!');
      return;
    } else if (!socket.musicData.queue) {
      message.reply('There are no songs in queue');
      return;
    } else if (socket.musicData.songDispatcher.paused) {
      socket.musicData.songDispatcher.resume();
      setTimeout(() => {
        socket.musicData.songDispatcher.end();
      }, 100);
      socket.musicData.queue.length = 0;
      return;
    } else {
      socket.musicData.songDispatcher.end();
      socket.musicData.queue.length = 0;
      return;
    }
  }
};
