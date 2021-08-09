'use strict';

const BaseCommand = require('../BaseCommand');

class MoveAllCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'moveall',
      description: 'Moves all members in your vc (or specified vc) to another vc',
      usage: ['<string name of channel to move to>', '<string name of channel to move from> -> <string name of channel to move to>'],
      permissions: 'MOVE_MEMBERS',
      args: true,
    };
    super(socket, info);
  }

  async run(message, args) {
    let voiceChannel;
    let newChannel;
    let toChannel;
    let fromChannel;
    // Move users in curent channel
    if (args.indexOf('->') < 0) {
      // Check if voice channel
      voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        message.channel.send(`${message.member}, Join a channel and try again`);
        return;
      }

      toChannel = args.join(' ');

      // Check for new channel
      newChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.isVoice());
    } else {
      // Move users in specified channel
      fromChannel = args.slice(0, args.indexOf('->')).join(' ');
      toChannel = args.slice(args.indexOf('->') + 1).join(' ');
      voiceChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === fromChannel.toLowerCase() && channel.isVoice());
      newChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.isVoice());
    }

    let confMsg;

    if (newChannel && voiceChannel) {
      // Move members
      voiceChannel.members.forEach(member => {
        member.voice.setChannel(newChannel).catch(err => {
          this.socket.app.log.warn(module, err);
        });
      });
      confMsg = await message.channel.send(`Moving all voice members to ${newChannel.name}`);
    } else if (newChannel) {
      confMsg = await message.channel.send(`${message.member}, ${fromChannel} is not a valid voice channel!`);
    } else {
      confMsg = await message.channel.send(`${message.member}, ${toChannel} is not a valid voice channel!`);
    }
    message.delete();
    setTimeout(() => {
      if (confMsg.deletable) confMsg.delete();
    }, 3000);
  }
}

module.exports = MoveAllCommand;
