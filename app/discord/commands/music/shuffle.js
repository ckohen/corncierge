const { MessageEmbed } = require('discord.js');

module.exports = {
  channel: 'music',
  name: 'shuffle',
  description: 'Shuffle the song queue',
  role: 'DJ',

  async run(socket, message) {
    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof socket.musicData.songDispatcher == 'undefined' ||
      socket.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    if (socket.musicData.queue.length < 1)
      return message.reply('There are no songs in queue');

    shuffleQueue(socket.musicData.queue);

    const titleArray = [];
    socket.musicData.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title);
    });
    var numOfEmbedFields = 10;
    if (titleArray.length < 10) numOfEmbedFields = titleArray.length;
    var queueEmbed = socket.getEmbed('queue', []);
    for (let i = 0; i < numOfEmbedFields; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    return message.channel.send(queueEmbed);
  }
};

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}
