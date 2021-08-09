'use strict';

const BaseCommand = require('../BaseCommand');

class QueueCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'queue',
      aliases: ['song-list', 'next-songs', 'q'],
      description: 'Display the song queue',
      channel: 'music',
    };
    super(socket, info);
  }

  run(message) {
    const musicData = this.socket.cache.musicData.get(String(message.guildId));
    if (!musicData?.subscription?.queue || musicData.subscription.queue.length === 0) {
      return message.channel.send(`${message.member}, There are no songs in queue!`);
    }
    const titleArray = [];
    // Display only first 10 items in queue
    musicData.subscription.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title);
    });
    var queueEmbed = this.socket.getEmbed('queue', [musicData.subscription.queue]);
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    return message.channel.send({ embeds: [queueEmbed] });
  }
}

module.exports = QueueCommand;
