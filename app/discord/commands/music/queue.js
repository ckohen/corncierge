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

  run(socket, message) {
    const musicData = socket.musicData.get(String(message.guild.id));
    if (musicData.queue.length === 0) {
      return message.channel.send(`${message.member}, There are no songs in queue!`);
    }
    const titleArray = [];
    // Display only first 10 items in queue
    musicData.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title);
    });
    var queueEmbed = socket.getEmbed('queue', [musicData.queue]);
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    return message.channel.send(queueEmbed);
  }
}

module.exports = QueueCommand;
