'use strict';

const BaseCommand = require('../BaseCommand');

class MakeMeCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'makeme',
      description: 'makeme [The role you would like to add]',
      usage: '<role>',
      args: true,
    };
    super(socket, info);
  }

  run(message, args) {
    args = args.join(' ');
    // A list of key value pairs with channels and available roles
    let channelName = this.socket.cache.roleManager.get(String(message.guildId)).addRoles;

    // If a role from a valid channel is typed in that channel add the role to the user
    const chan = channelName[String(message.channelId)] ?? channelName[String(message.channel?.parentId)];
    if (chan) {
      roleAssign(this.socket, message, chan, args);
    } else {
      message.delete();
    }
  }
}

// Role manager
function roleAssign(socket, message, validRoles, args) {
  // Convert role request to lower case for comparison
  let roleName = args.toLowerCase();
  // Set user to command sender
  let member = message.member;

  // If roleName is a valid role within the channel
  let roleAssigned = false;

  if (validRoles.indexOf(roleName) > -1) {
    // Find the role within the discord server
    let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase());
    try {
      // Add the role requested
      member.roles.add(role);
      roleAssigned = true;
    } catch (err) {
      socket.app.log.warn(module, err);
      roleAssigned = false;
    }

    socket.app.log.verbose(module, `Added ${role.name} to ${member.user.username}`);

    // Notify user of role addition
    roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
    if (roleAssigned) {
      message.channel.send(`You now have the role ${roleName}, ${member}`);
    } else {
      message.channel.send(`There was an error adding the role ${roleName}, ${member}`);
    }
  } else {
    // If the role is invalid in the channel, notify user
    roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
    message.channel.send(`${roleName} isn't a valid role, ${member}`);
    roleAssigned = false;
  }

  // Deletes command and resopne messages after 3 seconds
  setTimeout(() => {
    message.channel.bulkDelete(2);
  }, 3000);

  return roleAssigned;
}

module.exports = MakeMeCommand;
