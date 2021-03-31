'use strict';

const BaseCommand = require('../BaseCommand');

class RoleManagerCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'rolemanager',
      aliases: ['rm'],
      description: 'Allows server admins to change self-assingable roles',
      usage: [
        '(add|remove) <#channel> <@role> [@role @role etc..] [makeme|makemenot]',
        'remove <#channel> [role(not mentioned, e.g. if deleted)]',
        '[list] [#channel]',
      ],
      permissions: 'MANAGE_ROLES',
    };
    super(socket, info);
  }

  async run(message, args) {
    const commandPrefix = this.socket.prefixes.get(String(message.guild.id)).prefix;
    const routines = ['add', 'remove', 'list'];

    const [methodRaw, channelRaw, roleRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'list';

    if (!routines.includes(method)) {
      message.channel.send(`${message.member}, Specify a valid subroutine`);
      return;
    }

    let channel = null;
    let roles = [];
    let specified = '';

    // Check for actual channel
    if (channelRaw && channelRaw.startsWith('<#') && channelRaw.endsWith('>')) {
      channel = message.guild.channels.cache.get(channelRaw.slice(2, -1));
    } else if (channelRaw) {
      message.channel.send(`${message.member}, Please specify a valid channel`);
      return;
    }

    // Check for actual role
    if (roleRaw && roleRaw.startsWith('<@&') && roleRaw.endsWith('>')) {
      roles[0] = message.guild.roles.cache.get(roleRaw.slice(3, -1));
    }

    // Check for extra roles and specifying makeme or makemenot only
    if (extraArgs) {
      extraArgs.forEach(elem => {
        if (elem.startsWith('<@&') && elem.endsWith('>')) {
          roles.push(message.guild.roles.cache.get(elem.slice(3, -1)));
        }
      });
      if (extraArgs[extraArgs.length - 1] === 'makeme' || extraArgs[extraArgs.length - 1] === 'makemenot') {
        specified = extraArgs[extraArgs.length - 1];
      }
    }

    let botHighest = message.guild.me.roles.highest;
    roles = roles.filter(role => role.comparePositionTo(botHighest) < 0 && !role.managed);

    let roleNames = [];
    roles.forEach(role => roleNames.push(role.name.toLowerCase()));

    //  A list of key value pairs with channels and available roles
    let guild = this.socket.roleManager.get(String(message.guild.id));

    switch (method) {
      case 'add':
        if (roleNames.length < 1) {
          message.channel.send(
            `${message.member}, Please provide at least one valid role to add. *The bot must have a higher role than all roles it is assigning!*`,
          );
          return;
        }
        // Check if user specified to only add to makeme
        if (specified !== 'makemenot') {
          if (guild.addRoles[String(channel.id)]) {
            guild.addRoles[String(channel.id)] = modifyRoles(guild.addRoles[String(channel.id)], roleNames);
          } else {
            guild.addRoles[String(channel.id)] = roleNames;
          }
        }

        // Check if user specified to only add to makemenot
        if (specified !== 'makeme') {
          if (guild.removeRoles[String(channel.id)]) {
            guild.removeRoles[String(channel.id)] = modifyRoles(guild.removeRoles[String(channel.id)], roleNames);
          } else {
            guild.removeRoles[String(channel.id)] = roleNames;
          }
        }
        break;
      case 'remove':
        if (roleNames.length < 1) {
          // Check if deleting a string based role

          if (roleRaw) {
            let roleString = roleRaw;
            if (extraArgs) {
              roleString = `${roleRaw} ${extraArgs.join(' ')}`;
            }

            let role = message.guild.roles.cache.find(data => data.name.toLowerCase() === roleString.toLowerCase());
            if (role) {
              roleNames.push(roleString);
              guild.addRoles[String(channel.id)] = await modifyRoles(guild.addRoles[String(channel.id)], roleNames, false);
              guild.removeRoles[String(channel.id)] = await modifyRoles(guild.removeRoles[String(channel.id)], roleNames, false);
              if (guild.addRoles[String(channel.id)].length < 1) {
                delete guild.addRoles[String(channel.id)];
              }
              if (guild.removeRoles[String(channel.id)].length < 1) {
                delete guild.removeRoles[String(channel.id)];
              }
            }
            break;
          }

          // Delete Whole channel
          if (guild.addRoles[String(channel.id)]) {
            delete guild.addRoles[String(channel.id)];
          }

          if (guild.removeRoles[String(channel.id)]) {
            delete guild.removeRoles[String(channel.id)];
          }
          await this.socket.app.database.tables.roleManager.edit(String(message.guild.id), guild.addRoles, guild.removeRoles);
          message.channel.send(`Deleted ${channel} from role manager`);
          return;
        }

        // Check if user specified to only remove from makeme
        if (specified !== 'makemenot' && guild.addRoles[String(channel.id)]) {
          guild.addRoles[String(channel.id)] = modifyRoles(guild.addRoles[String(channel.id)], roleNames, false);
          // Delete channel if no roles left
          if (guild.addRoles[String(channel.id)].length < 1) {
            delete guild.addRoles[String(channel.id)];
          }
        }

        // Check if user specified to only remove from makemenot
        if (specified !== 'makeme' && guild.removeRoles[String(channel.id)]) {
          guild.removeRoles[String(channel.id)] = modifyRoles(guild.removeRoles[String(channel.id)], roleNames, false);
          // Delete channel if no roles left
          if (guild.removeRoles[String(channel.id)].length < 1) {
            delete guild.removeRoles[String(channel.id)];
          }
        }
        break;
      case 'list':
    }

    await this.socket.app.database.tables.roleManager.edit(String(message.guild.id), guild.addRoles, guild.removeRoles);

    // Determine the number of channels and get ready to loop through them
    let channels = Object.keys(guild.addRoles);
    let removeChannels = Object.keys(guild.removeRoles);
    removeChannels.forEach(id => {
      if (channels.indexOf(id) < 0) {
        channels.push(id);
      }
    });

    // Only return one channel if specified
    if (channel) {
      channels = [String(channel.id)];
    }

    // Create base embed
    let msg = this.socket.getEmbed('rolemanager', [message.member, commandPrefix]);
    if (channels.length < 1) {
      message.channel.send('**No roles specified yet**', msg);
      return;
    }
    // Variables for counting to limt
    let fields = 0;
    // Variables to store looped information
    let channelObj;
    let roleObj;
    let bothRoles = [];
    let addRoles = [];
    let removeRoles = [];
    let compiledRoles = [];
    // Loop through each channel found
    channels.forEach(channelID => {
      channelObj = message.guild.channels.cache.get(channelID);
      // Get role objects so discord can embed properly
      if (guild.addRoles[channelID]) {
        guild.addRoles[channelID].forEach(role => {
          roleObj = message.guild.roles.cache.find(data => data.name.toLowerCase() === role.toLowerCase());
          // Add roles in both list to the both array
          if (guild.removeRoles[channelID] && guild.removeRoles[channelID].indexOf(role) > -1) {
            bothRoles.push(roleObj);
          } else {
            addRoles.push(roleObj);
          }
        });
      }
      if (guild.removeRoles[channelID]) {
        guild.removeRoles[channelID].forEach(role => {
          roleObj = message.guild.roles.cache.find(data => data.name.toLowerCase() === role.toLowerCase());
          if (!guild.addRoles[channelID] || guild.addRoles[channelID].indexOf(role) < 0) {
            removeRoles.push(roleObj);
          }
        });
      }

      // Compile the full list
      if (bothRoles.length > 0) {
        compiledRoles = compiledRoles.concat(`\`${commandPrefix}makeme\` and \`${commandPrefix}makemenot\``, bothRoles);
      }
      if (addRoles.length > 0) {
        compiledRoles = compiledRoles.concat(`\`${commandPrefix}makeme\` *only*`, addRoles);
      }
      if (removeRoles.length > 0) {
        compiledRoles = compiledRoles.concat(`\`${commandPrefix}makemenot\` *only*`, removeRoles);
      }
      // Create and send embeds
      if (compiledRoles.length > 40) {
        for (let i = 1; i <= Math.ceil(compiledRoles.length / 40); i++) {
          if (fields < 24) {
            msg.addField(channelObj.name, compiledRoles.slice((i - 1) * 40, i * 40).join('\n'), true);
            fields += 1;
          } else {
            fields = 0;
            message.channel.send(msg);
            msg = this.socket.getEmbed('rolemanager', [message.member, commandPrefix]);
          }
        }
      } else if (compiledRoles.length > 0) {
        msg.addField(channelObj.name, compiledRoles.join('\n'), true);
        fields += 1;
      }
      // Clear arrays
      compiledRoles = [];
      bothRoles = [];
      addRoles = [];
      removeRoles = [];
    });

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
      newRoles.push(name);
    } else if (existingRoles.indexOf(name) > -1 && !add) {
      // Mode remove
      newRoles.splice(newRoles.indexOf(name), 1);
    }
  });
  return newRoles;
}

module.exports = RoleManagerCommand;
