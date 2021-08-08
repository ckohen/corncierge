'use strict';

const BaseCommand = require('../BaseCommand');

class RemoveCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'remove',
      description: 'Remove a specific song from queue',
      usage: '<song number to delete>',
      channel: 'music',
      role: 'DJ',
      args: true,
    };
    super(socket, info);
  }

  run(message, args) {
    const songNumber = Number(args.join(' '));
    const musicData = this.socket.cache.musicData.get(String(message.guildId));
    if (songNumber < 1 || songNumber >= musicData.queue.length) {
      return message.channel.send(`${message.member}, Please enter a valid song number`);
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send(`${message.member}, Join a channel and try again`);

    if (typeof musicData.songDispatcher === 'undefined' || musicData.songDispatcher === null) {
      return message.channel.send(`${message.member}, There is no song playing right now!`);
    }

    musicData.queue.splice(songNumber - 1, 1);
    return message.channel.send(`Removed song number ${songNumber} from queue`);
  }
}

module.exports = RemoveCommand;
