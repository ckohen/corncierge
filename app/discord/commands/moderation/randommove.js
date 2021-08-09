'use strict';

const { clamp } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class RandomMoveCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'randommove',
      aliases: ['randmove'],
      description: 'Randomly moves a specifed number of users between vcs',
      usage: [
        'to [string name of channel to always move to]',
        'from [string name of channel to always move from]',
        '<number> [string name of channel to move to]',
        '<number> [string name of channel to move from] -> [string name of channel to move to]',
      ],
      permissions: 'MOVE_MEMBERS',
      args: true,
    };
    super(socket, info);
  }

  async run(message, args) {
    const socket = this.socket;
    const commandPrefix = socket.cache.prefixes.get(String(message.guildId)).prefix;
    const routines = ['to', 'from', 'move'];

    let methodRaw = args.shift();
    let method = Number(methodRaw) ? 'move' : methodRaw.toLowerCase();

    if (!routines.includes(method) || methodRaw.toLowerCase() === 'move') {
      message.channel.send(`${message.member}, Specifiy a valid number of people or \`to\` or \`from\` to specify a permanent channel setting!`);
      return;
    }

    // A list of key value pairs with stored channels for each guild
    let settings = socket.cache.randomChannels.get(String(message.guildId));

    if (typeof settings === 'undefined' || settings === null) {
      socket.cache.randomChannels.set(String(message.guildId), { guildId: String(message.guildId), toChannel: '', fromChannel: '' });
      await socket.app.database.tables.randomChannels.add(String(message.guildId));
      settings = socket.cache.randomChannels.get(String(message.guildId));
    }

    let voiceChannel;
    let newChannel;
    let editChannel;
    let toChannel;
    let fromChannel;
    let moving;
    let num;

    switch (method) {
      case 'to':
        // Find the channel if it exists and store it
        editChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase());
        // Remove channel if the requested channel does not exist
        if (typeof editChannel === 'undefined' || editChannel === null) {
          settings.toChannel = '';
          await socket.app.database.tables.randomChannels.edit(String(message.guildId), settings.toChannel, settings.fromChannel);
          message.channel.send(`${message.member}, There is no longer a permanent random move **to** channel set!`);
          return;
        }
        settings.toChannel = String(editChannel.id);
        await socket.app.database.tables.randomChannels.edit(String(message.guildId), settings.toChannel, settings.fromChannel);
        message.channel.send(`${message.member}, Permanent random move **to** channel is now ${editChannel.name}`);
        return;
      case 'from':
        // Find the channel if it exists and store it
        editChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.join(' ').toLowerCase());
        // Remove channel if the requested channel does not exist
        if (typeof editChannel === 'undefined' || editChannel === null) {
          settings.fromChannel = '';
          await socket.app.database.tables.randomChannels.edit(String(message.guildId), settings.toChannel, settings.fromChannel);
          message.channel.send(`${message.member}, There is no longer a permanent random move **from** channel set!`);
          return;
        }
        settings.fromChannel = String(editChannel.id);
        await socket.app.database.tables.randomChannels.edit(String(message.guildId), settings.toChannel, settings.fromChannel);
        message.channel.send(`${message.member}, Permanent random move **from** channel is now ${editChannel.name}`);
        return;
      case 'move':
        num = Number(methodRaw);
        if (settings.toChannel.length > 0) {
          newChannel = await message.member.guild.channels.cache.get(settings.toChannel);
          toChannel = `Stored, change with \`${commandPrefix}randmove to <channel>\`,`;
        }
        if (settings.fromChannel.length > 0) {
          voiceChannel = await message.member.guild.channels.cache.get(settings.fromChannel);
          fromChannel = `Stored, change with \`${commandPrefix}randmove from <channel>\`,`;
        }
        // Move users in curent channel
        if (args.indexOf('->') < 0) {
          // Check if voice channel
          if (!voiceChannel) voiceChannel = message.member.voice.channel;
          if (!voiceChannel) {
            message.channel.send(
              `${message.member}, Join a channel or specify a from channel with \`${commandPrefix}randmove <number> <from> -> <to>\` ` +
                `or \`${commandPrefix}readmove from <channel>\` and try again`,
            );
            return;
          }

          // If specified, use the override instead
          if (args.length > 0) {
            toChannel = args.join(' ');
            // Check for new channel
            newChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.isVoice());
          }
          if (!newChannel) {
            message.channel.send(
              `${message.member}, Specify a channel with \`${commandPrefix}randmove <number> <to>\` or \`${commandPrefix}readmove to <channel>\` and try again`,
            );
            return;
          }
        } else {
          // Move users in specified channel
          fromChannel = args.slice(0, args.indexOf('->')).join(' ');
          toChannel = args.slice(args.indexOf('->') + 1).join(' ');
          voiceChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === fromChannel.toLowerCase() && channel.isVoice());
          newChannel = message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === toChannel.toLowerCase() && channel.isVoice());
        }
        if (num === clamp(num, 1, voiceChannel.members.size)) {
          moving = voiceChannel.members.filter(member => !member.user.bot).random(num);
        } else {
          moving = voiceChannel.members;
          num = 'all';
        }
        break;
    }

    let confMsg;

    if (newChannel && voiceChannel) {
      // Move members
      moving.forEach(member => {
        member.voice.setChannel(newChannel).catch(err => {
          socket.app.log.warn(module, err);
        });
      });
      confMsg = await message.channel.send(`Randomly moving ${num} voice members to ${newChannel.name}`);
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

module.exports = RandomMoveCommand;
