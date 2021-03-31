'use strict';

const BaseCommand = require('../BaseCommand');

class NukeCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'nuke',
      description: 'Disconnects all members in a channel',
      permissions: 'MOVE_MEMBERS',
    };
    super(socket, info);
  }

  run(message) {
    // Check if voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    // Unmute members
    voiceChannel.members.forEach(member => {
      member.voice.kick().catch(err => {
        this.socket.app.log.warn(module, err);
      });
    });

    message.delete();
  }
}

module.exports = NukeCommand;
