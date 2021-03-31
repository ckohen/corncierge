'use strict';

const { isSnowflake } = require('../../../util/UtilManager').discord;
const BaseCommand = require('../BaseCommand');

class ColorManagerCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'colormanager',
      aliases: ['cm'],
      description: 'Allows server admins to change self-assingable color roles',
      usage: ['', '(add|remove) <@role> [@role @role etc..]', 'remove <role name || role id(not mentioned, e.g. if deleted)>', 'channel <#channel>', '[list]'],
      permissions: 'MANAGE_ROLES',
    };
    super(socket, info);
  }

  async run(message, args) {
    const commandPrefix = this.socket.cache.prefixes.get(String(message.guild.id)).prefix;
    const routines = ['add', 'remove', 'channel', 'list'];

    const [methodRaw, chroleRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'list';

    if (!routines.includes(method)) {
      message.channel.send(`${message.member}, Specify a valid subroutine`);
      return;
    }

    let channel = null;
    let roles = [];

    //  A list of key value pairs with channels and available roles
    let guild = this.socket.cache.colorManager.get(String(message.guild.id));

    // The second argument changes
    if (method === 'channel') {
      // Check for actual channel
      if (chroleRaw && chroleRaw.startsWith('<#') && chroleRaw.endsWith('>')) {
        channel = message.guild.channels.cache.get(chroleRaw.slice(2, -1));
      } else if (chroleRaw) {
        message.channel.send(`${message.member}, Please specify a valid channel`);
        return;
      }
    } else {
      // Check for actual role
      if (chroleRaw && chroleRaw.startsWith('<@&') && chroleRaw.endsWith('>')) {
        roles[0] = message.guild.roles.cache.get(chroleRaw.slice(3, -1));
      }
      channel = Object.keys(guild.roles)[0];
    }

    // Check for extra roles
    if (extraArgs) {
      extraArgs.forEach(elem => {
        if (elem.startsWith('<@&') && elem.endsWith('>')) {
          roles.push(message.guild.roles.cache.get(elem.slice(3, -1)));
        }
      });
    }

    let botHighest = message.guild.me.roles.highest;
    roles = roles.filter(role => role.comparePositionTo(botHighest) < 0 && !role.managed);

    let roleNames = [];
    roles.forEach(role => roleNames.push(role.name.toLowerCase()));
    let roleSnowflakes = [];
    roles.forEach(role => roleSnowflakes.push(role.id));

    switch (method) {
      case 'add':
        // There must be a channel first
        if (Object.keys(guild.roles).length < 1) {
          message.channel.send(`${message.member}, Please specify a color change channel using \`${commandPrefix}colormanager channel <#channel>\` first`);
          return;
        }

        if (roleNames.length < 1) {
          message.channel.send(
            `${message.member}, Please provide at least one valid role to add. *The bot must have a higher role than all roles it is assigning!*`,
          );
          return;
        }

        // Edit channel and snowflakes
        guild.roles[channel] = modifyRoles(guild.roles[channel], roleNames);
        guild.snowflakes = modifySnowflakes(guild.snowflakes, roleSnowflakes);
        break;
      case 'remove':
        // There must be a channel first
        if (Object.keys(guild.roles).length < 1) {
          message.channel.send(`${message.member}, Please specify a color change channel using \`${commandPrefix}colormanager channel <#channel>\` first`);
          return;
        }

        // Auto remove deleted roles
        roleSnowflakes.push(...guild.snowflakes.filter(id => message.guild.roles.resolve(id) === null));

        // Check if deleting a string based role
        if (roleNames.length < 1 && chroleRaw) {
          let roleString = chroleRaw;
          if (extraArgs.length) {
            roleString = `${chroleRaw} ${extraArgs.join(' ')}`;
          }

          let role = message.guild.roles.cache.find(data => data.name.toLowerCase() === roleString.toLowerCase());
          if (role) {
            roleNames.push(roleString);
            roleSnowflakes.push(role.id);
            guild.roles[channel] = modifyRoles(guild.roles[channel], roleNames, false);
            guild.snowflakes = modifySnowflakes(guild.snowflakes, roleSnowflakes, false);
          } else if (isSnowflake(roleString)) {
            roleSnowflakes.push(roleString);
            guild.snowflakes = modifySnowflakes(guild.snowflakes, roleSnowflakes, false);
          }
          break;
        }

        guild.roles[channel] = modifyRoles(guild.roles[channel], roleNames, false);
        guild.snowflakes = modifySnowflakes(guild.snowflakes, roleSnowflakes, false);

        break;
      case 'channel':
        if (Object.keys(guild.roles).length < 1) {
          guild.roles[String(channel.id)] = ['remove'];
        } else {
          let oldchannel = Object.keys(guild.roles)[0];
          roles = [];
          guild.roles[oldchannel].forEach(role => {
            roles.push(role);
          });
          delete guild.roles[oldchannel];
          guild.roles[String(channel.id)] = roles;
        }
        break;
      case 'list':
    }

    await this.socket.app.database.tables.colorManager.edit(String(message.guild.id), guild.roles, guild.snowflakes);

    // Determine the number of channels and get ready to loop through them
    let channels = Object.keys(guild.roles);

    // Create base embed
    let msg = this.socket.getEmbed('colormanager', [message.member, commandPrefix]);
    if (channels.length < 1) {
      message.channel.send('**No channel specified yet**', msg);
      return;
    }
    // Variables for counting to limt
    let fields = 0;
    // Variables to store looped information

    let outRoles = [];
    // Loop through each channel found
    const channelObj = message.guild.channels.cache.get(channels[0]);

    // Get role mentions so discord can embed properly
    let roleMention;
    guild.snowflakes.forEach(id => {
      roleMention = `<@&${id}>`;
      outRoles.push(roleMention);
    });

    // Create and send embeds
    if (outRoles.length > 40) {
      for (let i = 1; i <= Math.ceil(outRoles.length / 40); i++) {
        if (fields < 24) {
          msg.addField(channelObj.name, outRoles.slice((i - 1) * 40, i * 40).join('\n'), true);
          fields += 1;
        } else {
          fields = 0;
          message.channel.send(msg);
          msg = this.socket.getEmbed('colormanager', [message.member, commandPrefix]);
        }
      }
    } else if (outRoles.length > 0) {
      msg.addField(channelObj.name, outRoles.join('\n'), true);
      fields += 1;
    }
    // Clear arrays
    outRoles = [];

    msg.addField('Remove Color', 'remove', true);
    message.channel.send(msg);
  }
}

function modifyRoles(existingRoles, changedRoles, add = true) {
  let newRoles = [];
  // Add all existing Roles to newRole array
  existingRoles.forEach(roleName => {
    newRoles.push(roleName);
  });
  changedRoles.forEach(name => {
    // Mode add
    if (existingRoles.indexOf(name) < 0 && add) {
      newRoles.splice(newRoles.length - 1, 1);
      newRoles.push(name);
      newRoles.push('remove');
    } else if (existingRoles.indexOf(name) > -1 && !add) {
      // Mode remove
      newRoles.splice(newRoles.indexOf(name), 1);
    }
  });
  return newRoles;
}

function modifySnowflakes(existingSnowflakes, changedSnwoflakes, add = true) {
  let newSnowflakes = [];
  // Add all existing Roles to newRole array
  existingSnowflakes.forEach(roleID => {
    newSnowflakes.push(roleID);
  });
  changedSnwoflakes.forEach(id => {
    // Mode add
    if (existingSnowflakes.indexOf(id) < 0 && add) {
      newSnowflakes.push(id);
    } else if (existingSnowflakes.indexOf(id) > -1 && !add) {
      // Mode remove
      newSnowflakes.splice(newSnowflakes.indexOf(id), 1);
    }
  });
  return newSnowflakes;
}

module.exports = ColorManagerCommand;
