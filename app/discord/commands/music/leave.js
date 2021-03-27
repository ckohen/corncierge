'use strict';

const BaseCommand = require('../BaseCommand');

class LeaveCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'leave',
      aliases: ['end', 'fuckoff'],
      description: 'Leaves voice channel if in one',
      channel: 'music',
      role: 'DJ',
    };
    super(socket, info);
  }

  run(socket, message) {
    var voiceChannel = message.member.voice.channel;
    let musicData = socket.musicData.get(String(message.guild.id));
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
    } else if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      message.channel.send(`${message.member}, There is no song playing right now!`);
    } else if (!musicData.queue) {
      message.channel.send(`${message.member}, There are no songs in queue`);
    } else if (musicData.songDispatcher.paused) {
      musicData.songDispatcher.resume();
      setTimeout(() => {
        musicData.songDispatcher.end();
      }, 100);
      musicData.queue.length = 0;
    } else {
      musicData.songDispatcher.end();
      musicData.queue.length = 0;
    }
  }
}

module.exports = LeaveCommand;
