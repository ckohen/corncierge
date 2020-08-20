module.exports =  {
  channel: 'music',
      name: 'skipto',
      description: 'Skip to a specific song in the queue, provide the song number as an argument',
      role: 'DJ',
      args: true,
      usage: '<song number>',

  async run(socket, message, args) {
    songNumber = Number(args.join(' '));
    if (songNumber < 1 || songNumber > socket.musicData.queue.length + 1) {
      return message.reply('Please enter a valid song number');
    }
    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    if (socket.musicData.queue < 1)
      return message.reply('There are no songs in queue');

    socket.musicData.queue.splice(0, songNumber - 1);
    socket.musicData.songDispatcher.end();
    return;
  }
};
