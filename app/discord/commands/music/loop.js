'use strict';

const BaseCommand = require('../BaseCommand');

class LoopCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'loop',
      description: 'Loop the current playing song',
      usage: '<amount>',
      channel: 'music',
      role: 'DJ',
      args: true,
    };
    super(socket, info);
  }

  run(socket, message, args) {
    const numOfTimesToLoop = Number(args.join(' '));
    const musicData = socket.musicData.get(String(message.guild.id));
    if (!musicData.isPlaying) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
      return;
    }

    for (let i = 0; i < numOfTimesToLoop; i++) {
      musicData.queue.unshift(musicData.nowPlaying);
    }

    message.channel.send(`${musicData.nowPlaying.title} looped ${numOfTimesToLoop} ${numOfTimesToLoop === 1 ? 'time' : 'times'}`);
  }
}

module.exports = LoopCommand;
