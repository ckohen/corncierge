module.exports = {
  channel: 'music',
  name: 'skipall',
  aliases: ['skip-all', 'queue-clear', 'clearq', 'clear-q'],
  description: 'Skip all songs in queue',
  role: 'DJ',

  async run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    if (!socket.musicData.queue)
      return message.reply('There are no songs in queue');
    socket.musicData.queue.length = 0; // clear queue
    return;
  }
};
