'use strict';

const BaseCommand = require('../BaseCommand');

class ShuffleCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'shuffle',
      description: 'Shuffle the song queue',
      channel: 'music',
      role: 'DJ',
    };
    super(socket, info);
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    const musicData = this.socket.cache.musicData.get(String(message.guild.id));
    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    if (musicData.queue.length < 1) {
      message.channel.send(`${message.member}, There are no songs in queue`);
      return;
    }

    shuffleQueue(musicData.queue);

    const titleArray = [];
    musicData.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title);
    });
    var numOfEmbedFields = 10;
    if (titleArray.length < 10) numOfEmbedFields = titleArray.length;
    var queueEmbed = this.socket.getEmbed('queue', [musicData.queue]);
    for (let i = 0; i < numOfEmbedFields; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    }
    message.channel.send(queueEmbed);
  }
}

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}

module.exports = ShuffleCommand;
