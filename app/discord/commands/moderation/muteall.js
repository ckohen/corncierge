'use strict';

const BaseCommand = require('../BaseCommand');

class MuteAllCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'muteall',
      description: 'Mutes all members in a channel (auto-unmute after)',
      usage: ['', '[delay before auto-unmute or 0 for indefinte]'],
      permissions: 'MUTE_MEMBERS',
    };
    super(socket, info);
  }

  async run(message, args) {
    // Check if voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    let delay = 15000;

    const newCountRaw = args[0];
    const newCount = newCountRaw ? Number(newCountRaw) : -1;

    if (newCount > 0) {
      delay = newCount * 1000;
    }

    // Count muted users
    let count = voiceChannel.members.size;
    if (voiceChannel.members) {
      // Mute members
      await voiceChannel.members.forEach(member => {
        if (!member.user.bot && !(member === message.member)) {
          member.voice.setMute(true).catch(err => {
            this.socket.app.log.warn(module, err);
          });
        } else {
          count -= 1;
        }
      });
    }

    let confMsg = await message.channel.send(`Muted ${count} users in ${voiceChannel}`);

    message.delete();
    setTimeout(() => {
      if (confMsg.deletable) confMsg.delete();
    }, 3000);

    if (newCount !== 0) {
      setTimeout(() => {
        voiceChannel.members.forEach(member => {
          member.voice.setMute(false).catch(err => {
            this.socket.app.log.warn(module, err);
          });
        });
      }, delay);
    }
  }
}

module.exports = MuteAllCommand;
