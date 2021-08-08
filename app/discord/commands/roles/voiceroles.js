'use strict';

const { confirmAction } = require('../../../util/UtilManager').discord;
const BaseCommand = require('../BaseCommand');

class VoiceRolesCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'voiceroles',
      aliases: ['voice', 'vr'],
      description: 'Allows server admins to set voice roles linked to voice channels',
      usage: ['add <@role> <#channel> [#channel #channel ...]', 'add <@role> <channel name>', 'remove (@role|#channel|channel name)', '[list]'],
      permissions: 'MANAGE_ROLES',
    };
    super(socket, info);
  }

  async run(message, args) {
    const commandPrefix = this.socket.cache.prefixes.get(String(message.guild.id)).prefix;
    const routines = ['add', 'remove', 'list'];

    const [methodRaw, chRoleRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'list';

    if (!routines.includes(method)) {
      message.channel.send(`${message.member}, Specify a valid subroutine`);
      return;
    }

    let role = null;
    let roleObj;
    let channels = [];

    //  A list of key value pairs with channels and available roles
    let guild = this.socket.cache.voiceRoles.get(String(message.guild.id));

    // Check if channel or role and if it's valid
    if (chRoleRaw && chRoleRaw.startsWith('<#') && chRoleRaw.endsWith('>')) {
      channels[0] = chRoleRaw.slice(2, -1);
    } else if (chRoleRaw && chRoleRaw.startsWith('<@&') && chRoleRaw.endsWith('>')) {
      role = chRoleRaw.slice(3, -1);
      roleObj = message.guild.roles.cache.get(role);
    }

    let channelObj;
    // Check for extra channels
    if (extraArgs) {
      extraArgs.forEach(elem => {
        if (elem.startsWith('<#') && elem.endsWith('>')) {
          // Check if the current channel is a voice channel
          channelObj = message.guild.channels.cache.get(elem.slice(2, -1));
          if (channelObj && channelObj.type === 'voice') {
            channels.push(elem.slice(2, -1));
          }
        }
      });
    }

    // Limit roles to be below bots highest role
    let botHighest = message.guild.me.roles.highest;
    if (method === 'add' && (!roleObj || roleObj.comparePositionTo(botHighest) > -1 || roleObj.managed)) {
      message.channel.send(`${message.member}, Please provide a valid role to add. *The bot must have a higher role than the roles it is assigning!*`);
      return;
    }

    // If there are no channels, try using a channel name instead
    if (channels.length < 1) {
      let namedChannel = extraArgs.join(' ');
      if (method !== 'add') {
        namedChannel = `${chRoleRaw} ${namedChannel}`;
      }
      namedChannel = await message.guild.channels.cache.find(
        channel => channel.name.toLowerCase().trim() === namedChannel.toLowerCase().trim() && channel.type === 'voice',
      );
      if (namedChannel) {
        channels[0] = namedChannel.id;
      }
    }

    // Store the existing emojis
    let roles = Object.keys(guild.data);
    let channel;
    let duplicate;
    let move;

    switch (method) {
      case 'add':
        // Only allow 5 different voice roles
        if (roles.length > 4 && roles.indexOf(role) < 0) {
          message.channel.send(`${message.member}, There are already 5 sets of voice roles in this server, plese remove one first.`);
          return;
        }

        // Catch if no channels are being added
        if (channels.length < 1) {
          message.channel.send(`${message.member}, Please specify at least one channel where the role should be assigned.`);
          return;
        }

        // Check if the channel already exists in one of the role associations
        duplicate = false;
        move = false;
        for (const channelId of channels) {
          // Loop through the role list to check for duplicates
          roles.forEach(roleId => {
            if (guild.data[roleId].indexOf(channelId) > -1) {
              duplicate = true;
            }
          });
          // If it's a duplicate, confirm with the user what they want to do
          if (duplicate) {
            channel = message.guild.channels.cache.get(channelId);
            /* eslint-disable no-await-in-loop */
            const confirm = await confirmAction(
              message,
              `The channel ${channel} already has a role associated with it. Would you like to change to the new role? ✅ (yes) or ❌(no)`,
              60000,
            ).catch(() => false);
            if (confirm) move = true;

            if (move) {
              roles.forEach(roleId => {
                if (guild.data[roleId].indexOf(channelId) > -1) {
                  guild.data[roleId].splice(guild.data[roleId].indexOf(channelId), 1);
                  if (guild.data[roleId].length < 1) {
                    delete guild.data[roleId];
                  }
                }
              });
            } else {
              channels.splice(channels.indexOf(channelId), 1);
            }
          }
          move = false;
          duplicate = false;
        }

        // Put the channels in the guild array
        if (roles.indexOf(role) > -1) {
          guild.data[role] = guild.data[role].concat(channels);
        } else {
          guild.data[role] = channels;
        }
        break;
      case 'remove':
        // Handle deleting roles and channels differently
        if (role) {
          if (roles.indexOf(role) > -1) {
            delete guild.data[role];
            message.channel.send(`That voice role will no longer be assigned for all associated channels.`);
          } else {
            message.channel.send(`${message.member}, That role is not currently associated with any voice channels!`);
            return;
          }
        } else if (channels[0]) {
          // Search for the role that the channel is associated with
          let removed = false;
          let roleRemoved = false;
          roles.forEach(roleId => {
            if (guild.data[roleId].indexOf(channels[0]) > -1) {
              guild.data[roleId].splice(guild.data[roleId].indexOf(channels[0]), 1);
              if (guild.data[roleId].length < 1) {
                delete guild.data[roleId];
                roleRemoved = true;
              }
              removed = true;
            }
          });
          // Confirm the result
          if (removed) {
            message.channel.send(
              `That channel no longer has a voice role associated with it. ${
                roleRemoved ? 'The associated role has no more channels assigned, it has also been removed' : ''
              }`,
            );
          } else {
            message.channel.send(`${message.member}, That channel is not currently associated with a voice role.`);
            return;
          }
        }
        break;
      case 'list':
    }

    await this.socket.app.database.tables.voiceRoles.edit(String(message.guild.id), guild.data);

    // Create base embed
    let msg = this.socket.getEmbed('voiceRoles', [message.member, commandPrefix]);
    if (roles.length < 1) {
      message.channel.send({
        content: '**No voice roles specified yet**, a role named `voice` will apply to all voice channels until at least one is specified.',
        embeds: [msg],
      });
      return;
    }
    // Variables to store looped information
    roles = Object.keys(guild.data);
    let outChannels = [];
    // Loop through each emoji found
    for (const roleId of roles) {
      roleObj = message.guild.roles.cache.get(roleId);

      // Put channels in discord mention form so discord will resolve names
      guild.data[roleId].forEach(channelId => {
        outChannels.push(`<#${channelId}>`);
      });

      // Create actual data in embed
      if (outChannels.length > 30) {
        for (let i = 1; i <= Math.ceil(outChannels.length / 30); i++) {
          msg.addField(roleObj ? roleObj.name : `Deleted role, id: ${roleId}`, outChannels.slice((i - 1) * 30, i * 30).join('\n'), true);
        }
      } else if (outChannels.length > 0) {
        msg.addField(roleObj ? roleObj.name : `Deleted role, id: ${roleId}`, outChannels.join('\n'), true);
      }
      // Clear arrays
      outChannels = [];
    }
    message.channel.send({ embeds: [msg] });
  }
}

module.exports = VoiceRolesCommand;
