'use strict';

const { Collection } = require('discord.js');
const { clamp } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class RoomCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'room',
      description: 'Allows servers to have game rooms with waiting rooms',
      usage: [
        'list [room id]',
        'join <room id>',
        'leave [@user|username]',
        'create <room name>',
        'set [room id] (code|players) <option>',
        'remove [room id]',
        'clear <room id>',
        'fill [room id]',
        'transfer <@newOwner> [room id]',
      ],
    };
    super(socket, info);
  }

  async run(message, args) {
    const socket = this.socket;
    const commandPrefix = socket.cache.prefixes.get(String(message.guildId)).prefix;
    const routines = ['create', 'set', 'remove', 'list', 'join', 'leave', 'clear', 'fill', 'transfer'];

    const [methodRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'list';

    if (!routines.includes(method)) {
      return message.channel.send(`${message.member}, Specify a valid room management option!`);
    }

    //  A list of key value pairs with room ids and their associated room
    let rooms = socket.cache.rooms.get(String(message.guildId));

    if (typeof rooms === 'undefined' || rooms === null) {
      socket.cache.rooms.set(String(message.guildId), new Collection());
      rooms = socket.cache.rooms.get(String(message.guildId));
    }

    // Get the master room or create it
    let masterRoom = rooms.get('master');
    if (!masterRoom) {
      rooms.set('master', {
        id: 'master',
        name: null,
        owner: null,
        playerCount: 10,
        code: null,
        players: [],
        waiting: [],
        lastChannelId: null,
        lastMessageId: null,
      });
      masterRoom = rooms.get('master');
    }

    let room = false;
    let member;
    let inRoom;
    let existing;
    let alreadyPlaying;

    switch (method) {
      case 'create':
        // Only allow each server to have 25 rooms
        if (rooms.size > 25) {
          return message.channel.send(`${message.member}, There are already 25 rooms in this server, please wait for another room to close!`);
        }

        // Don't let a user own more than one room
        existing = rooms.find(data => data.owner === String(message.member.id));
        if (existing) {
          message.channel.send(
            `${message.member}, You already own a room: **ID**: ${existing.id}, **Name**: ${existing.name}. Please delete it to create a new room!`,
          );
          room = existing;
          break;
        }

        // Find the earliest available id
        for (let i = 1; i < 26; i++) {
          if (!rooms.has(String(i))) {
            // Create the new room
            rooms.set(String(i), {
              id: String(i),
              name: extraArgs.join(' ').substring(0, 30),
              owner: String(message.member.id),
              playerCount: 10,
              code: null,
              players: [String(message.member.id)],
              waiting: [],
              lastChannelId: null,
              lastMessageId: null,
            });
            socket.app.database.table.rooms.add(`${message.guildId}-${String(i)}`);
            room = rooms.get(String(i));
            break;
          }
        }

        rooms.each(index => {
          if (index.waiting.indexOf(String(message.member.id)) > -1) {
            index.waiting.splice(index.waiting.indexOf(String(message.member.id)), 1);
          }
        });
        break;
      case 'set':
        // Check if the requested room exists
        if (Number(extraArgs[0])) {
          let requested = extraArgs.shift();
          room = rooms.get(String(requested));
          if (typeof room === 'undefined' || rooms === null) {
            room = false;
            message.channel.send(`${message.member}, There is no room with room id ${requested}!`);
            break;
          }
        } else {
          room = rooms.find(data => data.players.indexOf(String(message.member.id)) > -1);
          if (typeof room === 'undefined' || rooms === null) {
            room = false;
            message.channel.send(`${message.member}, You must be in a room to use that command!`);
            break;
          }
        }
        // Check permissions
        if (
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can manage it!`);
        }
        // Set each option accordingly
        switch (extraArgs[0]) {
          case 'code':
            if (typeof extraArgs[1] === 'undefined' || rooms === null) {
              room.code = null;
            } else {
              room.code = extraArgs.slice(1).join(' ');
            }
            break;
          case 'players':
            // Allow up to 35 players in a room
            if (Number(extraArgs[1]) === clamp(Number(extraArgs[1], 0, 35))) {
              room.playerCount = Number(extraArgs[1]);
            } else {
              return message.channel.send(`${message.member}, The player count must be a number between 1 and 35!`);
            }
            break;
          default:
            return message.channel.send(`${message.member}, You can only set the number of players or a join code!`);
        }

        break;
      case 'remove':
        // Check if the room exists
        room = rooms.get(String(extraArgs[0]));
        if (typeof room === 'undefined' || rooms === null) {
          let msg = `There is no room with room id ${extraArgs[0]}!`;
          room = extraArgs[0] ? false : rooms.find(data => data.players.indexOf(String(message.member.id)) > -1);
          if (!extraArgs[0] && (typeof room === 'undefined' || rooms === null)) {
            room = false;
            msg = `You must be in a room to use that command!`;
          }
          if (!room) {
            message.reply(msg);
            break;
          }
        }
        // Check permissions
        if (
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can remove it!`);
        }
        // Delete the room
        message.channel.send(`Room ${room.id}: **${room.name}** has been successfully removed, the new list of rooms can be found below.`);
        socket.app.database.tables.rooms.delete(`${message.guildId}-${room.id}`);
        rooms.delete(room.id);
        room = false;
        break;
      case 'join':
        // Check if the room exists
        room = rooms.get(String(extraArgs[0]));
        if (typeof room === 'undefined' || rooms === null) {
          room = false;
          message.channel.send(`${message.member}, There is no room with room id ${extraArgs[0]}!`);
          break;
        }
        // Check if the user is already in a room
        inRoom = rooms.find(data => data.players.indexOf(message.member.id) > -1);
        if (typeof inRoom === 'undefined' || inRoom === null) {
          if (room.waiting.indexOf(message.member.id) < 0) {
            room.waiting.push(String(message.member.id));
          }
        } else {
          return message.channel.send(
            `${message.member}, You cannot join a room while playing in another room! Use \`${commandPrefix}room leave\` to leave your current room.`,
          );
        }
        break;
      case 'leave':
        // Mentioned user or user
        member = message.member;
        if (extraArgs[0]) {
          member = extraArgs[0].indexOf('<@') === 0 ? message.mentions.members.first() : false;
          if (!member) {
            member = message.guild.members.cache.find(cachedMember => cachedMember.user.username.toLowerCase() === extraArgs.join(' ').toLowerCase());
          }
        }

        if (!member) {
          return message.channel.send(`${message.member}, ${extraArgs.join(' ')} is not a valid member of the server!`);
        }
        member = String(member.id);

        // Find the room and determine whether they are a player or waiting
        alreadyPlaying = true;
        room = rooms.find(data => data.players.indexOf(member) > -1);
        if (typeof room === 'undefined' || room === null) {
          alreadyPlaying = false;
          room = rooms.find(data => data.waiting.indexOf(member) > -1);
          if (typeof room === 'undefined' || room === null) {
            room = false;
            return message.channel.send(`${message.member}, That member is not currently in a room!`);
          }
        }
        // Check Permissions for forced leave
        if (
          extraArgs[0] &&
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can force users to leave!`);
        }
        // Transfer ownership to next player in list
        if (member === room.owner) {
          if (room.players.length > 1) {
            room.owner = room.players[1];
            let newOwner = message.guild.members.cache.get(room.owner);
            message.channel.send(`The owner has left, the new owner is ${newOwner}`);
            room.players.shift();
          } else {
            // Delete the room if there is no new possible owner
            socket.app.database.tables.rooms.delete(`${message.guildId}-${room.id}`);
            rooms.delete(room.id);
            return message.channel.send(`${message.member}, You were the last player in ${room.name}, it has been deleted.`);
          }
        } else if (alreadyPlaying) {
          room.players.splice(room.players.indexOf(member), 1);
        } else {
          rooms.each(index => {
            if (index.waiting.indexOf(member) > -1) {
              index.waiting.splice(index.waiting.indexOf(member), 1);
            }
          });
        }
        break;
      case 'clear':
        // Check if the room exists
        room = rooms.get(String(extraArgs[0]));
        if (typeof room === 'undefined' || rooms === null) {
          room = false;
          message.channel.send(`${message.member}, There is no room with room id ${extraArgs[0]}!`);
          break;
        }
        // Check Permissions
        if (
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can manage it!`);
        }
        // Clear the room except for the owner
        room.players.splice(1);
        break;
      case 'fill':
        // Check if the room exists
        room = rooms.get(String(extraArgs[0]));
        if (typeof room === 'undefined' || rooms === null) {
          let msg = `There is no room with room id ${extraArgs[0]}!`;
          room = extraArgs[0] ? false : rooms.find(data => data.players.indexOf(String(message.member.id)) > -1);
          if (!extraArgs[0] && (typeof room === 'undefined' || rooms === null)) {
            room = false;
            msg = `You must be in a room to use that command!`;
          }
          if (!room) {
            message.reply(msg);
            break;
          }
        }
        // Check Permissions
        if (
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can manage it!`);
        }

        // Move members to fill up to player cap
        for (let i = 0; i < room.playerCount; i++) {
          if (!room.players[i] && room.waiting[0]) {
            let newPlayer = room.waiting.shift();
            room.players.push(newPlayer);
            // Remove member from all other waiting rooms
            rooms.each(index => {
              if (index.waiting.indexOf(newPlayer) > -1) {
                index.waiting.splice(index.waiting.indexOf(newPlayer), 1);
              }
            });
          }
        }
        break;
      case 'transfer':
        // Check if the member exists
        member = message.mentions.members ? String(message.mentions.members.first().id) : false;

        if (!member) {
          return message.channel.send(`${message.member}, That is not a valid member of the server!`);
        }
        // Check if the room exists
        room = rooms.get(String(extraArgs[1]));
        if (typeof room === 'undefined' || rooms === null) {
          let msg = `There is no room with room id ${extraArgs[1]}!`;
          room = extraArgs[1] ? false : rooms.find(data => data.players.indexOf(String(message.member.id))) > -1;
          if (!extraArgs[1] && (typeof room === 'undefined' || rooms === null)) {
            room = false;
            msg = `You must be in a room to use that command!`;
          }
          if (!room) {
            message.reply(msg);
            break;
          }
        }
        // Check Permissions
        if (
          String(message.member.id) !== room.owner &&
          !message.member.permissions.any(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MOVE_MEMBERS', 'MANAGE_ROLES'])
        ) {
          return message.channel.send(`${message.member}, Only the owner of a room and admins/mods can transfer ownership!`);
        }
        // Check if the new user is in the room
        if (room.players.indexOf(member) < 0) {
          return message.channel.send(`${message.member}, The new owner must be a player in the room!`);
        }
        room.players.splice(room.players.indexOf(member), 1);
        room.owner = member;
        room.players.unshift(member);
        break;
      case 'list':
        // Check if user is in a room
        inRoom = rooms.find(data => data.players.indexOf(message.member.id) > -1);
        if (inRoom) {
          room = inRoom;
        }
        // Check if user specified a specific room
        if (extraArgs[0]) {
          if (extraArgs[0] === 'all') {
            room = false;
          } else {
            room = rooms.get(extraArgs[0]);
          }
        }
        if (!room) {
          room = false;
        }
    }

    // Create base embed
    let embed = socket.getEmbed('rooms', [message.member, commandPrefix]);
    if (rooms.size < 2) {
      // Delete old master room information if it exists
      if (masterRoom && masterRoom.lastChannelId && masterRoom.lastMessageId) {
        let lastMasterMessageChannel = await socket.driver.channels.cache.get(masterRoom.lastChannelId);
        if (lastMasterMessageChannel) {
          lastMasterMessageChannel.messages
            .fetch(masterRoom.lastMessageId)
            .then(oldMsg => {
              oldMsg.delete();
            })
            .catch(() => undefined);
        }
      }
      return message.channel.send({ content: '**No rooms have been created yet**', embeds: [embed] }).then(sentMsg => {
        if (masterRoom) {
          masterRoom.lastChannelId = sentMsg.channel.id;
          masterRoom.lastMessageId = sentMsg.id;
        }
      });
    }

    // Count lines so we don't hit the charachter limit!
    let lines = 0;
    let owner;
    if (room) {
      // Delete old room information if it exists
      if (room.lastChannelId && room.lastMessageId) {
        let lastMessageChannel = await socket.driver.channels.cache.get(room.lastChannelId);
        if (lastMessageChannel) {
          lastMessageChannel.messages
            .fetch(room.lastMessageId)
            .then(oldMsg => {
              oldMsg.delete();
            })
            .catch(() => undefined);
        }
      }
      // Store discord's copy of the owner
      owner = message.guild.members.cache.get(room.owner);
      // Change the default description to be more acdurate for a single room
      embed.setDescription(
        `Join this room by typing \`${commandPrefix}room join ${room.id}\`. See a list of all rooms by typing \`${commandPrefix}room list all\``,
      );
      // Add Room name and code (if applicable)
      if (room.code) {
        embed.addField(`Room Name`, `${room.name} \n**Current code**: \`${room.code}\``);
      } else {
        embed.addField('Room Name', `${room.name}`);
      }
      // Create the list of users in the room
      let playing = [];
      room.players.forEach(player => playing.push(`<@!${player}>`));
      let waiting = [];
      room.waiting.forEach(player => waiting.push(`<@!${player}>`));
      let len = waiting.length;
      if (waiting.length < 1) {
        len = 0;
        waiting.push('No players waiting!');
      }
      if (waiting.length > 35) {
        waiting.splice(34);
        let extra = room.waiting.length - waiting.length;
        waiting.push(`...and ${extra} more members`);
      }
      // Add lists to the embed
      embed.addField(`Players (${playing.length}/${room.playerCount})`, playing.join('\n'), true);
      embed.addField(`Waiting Room (${len})`, waiting.join('\n'), true);
      // Change footer from default to room owner
      embed.setFooter({ text: `Room Owner: ${owner.user.username}`, iconURL: owner.user.displayAvatarURL() });
    } else {
      // Delete old master room information if it exists
      if (masterRoom && masterRoom.lastChannelId && masterRoom.lastMessageId) {
        let lastMasterMessageChannel = await socket.driver.channels.cache.get(masterRoom.lastChannelId);
        if (lastMasterMessageChannel) {
          lastMasterMessageChannel.messages
            .fetch(masterRoom.lastMessageId)
            .then(oldMsg => {
              oldMsg.delete();
            })
            .catch(() => undefined);
        }
      }
      // Create arrays for each embed
      let set1 = [];
      let set2 = [];
      let set3 = [];
      let fields = 1;
      // Loop through room list and add to arrays
      rooms
        .filter(data => data.id !== 'master')
        .each(data => {
          lines += 1;
          owner = message.guild.members.cache.get(data.owner);
          if (lines < 11) {
            set1.push(
              `**ID**: ${data.id}, **Name**: ${data.name}\n` +
                `Owned by ${owner.user.username}, Playing: ${data.players.length}/${data.playerCount}, Waiting: ${data.waiting.length}`,
            );
          } else if (lines < 21) {
            set2.push(
              `**ID**: ${data.id}, **Name**: ${data.name}\n` +
                `Owned by ${owner.user.username}, Playing: ${data.players.length}/${data.playerCount}, Waiting: ${data.waiting.length}`,
            );
          } else {
            set3.push(
              `**ID**: ${data.id}, **Name**: ${data.name}\n` +
                `Owned by ${owner.user.username}, Playing: ${data.players.length}/${data.playerCount}, Waiting: ${data.waiting.length}`,
            );
          }
        });

      // Edit the embed
      if (set2.length > 0) {
        fields = 2;
      }
      if (set3.length > 0) {
        fields = 3;
      }
      switch (fields) {
        case 1:
          embed.addField(`Rooms`, set1.join('\n'));
          break;
        case 2:
          embed.addField(`Rooms (1/${fields})`, set1.join('\n'));
          embed.addField(`Rooms (2/${fields})`, set2.join('\n'));
          break;
        case 3:
          embed.addField(`Rooms (1/${fields})`, set1.join('\n'));
          embed.addField(`Rooms (2/${fields})`, set2.join('\n'));
          embed.addField(`Rooms (3/${fields})`, set3.join('\n'));
          break;
        default:
      }
    }
    let lastMessage = await message.channel.send({ embeds: [embed] });
    if (room) {
      // Store last message information
      room.lastChannelId = lastMessage.channelId;
      room.lastMessageId = lastMessage.id;
      // Update database
      socket.app.database.tables.rooms.edit(`${message.guildId}-${room.id}`, room);
    } else if (masterRoom) {
      // Store last message information
      masterRoom.lastChannelId = lastMessage.channelId;
      masterRoom.lastMessageId = lastMessage.id;
    }
    return true;
  }
}

module.exports = RoomCommand;
