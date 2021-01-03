'use strict';

module.exports = {
  name: 'autorole',
  description: 'Allows server admins to set an automatically added role (with a delay time)',
  permissions: 'MANAGE_ROLES',
  aliases: ['ar'],
  usage: ['set <@role> [delay]', 'remove', 'status'],

  async run(socket, message, args) {
    const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;
    const routines = ['set', 'remove', 'status'];

    const [methodRaw, roleRaw, ...extraArgs] = args;
    const method = methodRaw ? methodRaw.toLowerCase() : 'status';

    if (!routines.includes(method)) {
      message.channel.send(`${message.member}, Specify a valid subroutine`);
      return;
    }

    let role;
    let time = 0;

    //  A list of key value pairs with current automatic role data
    let guild = socket.newMemberRoles.get(String(message.guild.id));

    // Check for actual role
    if (roleRaw && roleRaw.startsWith('<@&') && roleRaw.endsWith('>')) {
      role = message.guild.roles.cache.get(roleRaw.slice(3, -1));
    }

    // Check for time specification
    if (extraArgs) {
      extraArgs.forEach(elem => {
        // Parameter 'm' means minutes
        if (elem.slice(-1) === 'm') {
          time = Number(elem.slice(0, -1));
          // Convert time to minutes
          if (time) {
            time *= 60;
          }
        } else {
          time = Number(elem);
        }
        // Convert to milliseconds
        if (time) {
          if (time > 1200) {
            time = 1200;
          }
          time *= 1000;
        }
      });
    }

    // Limit role to be below bots highest role
    let botHighest = message.guild.me.roles.highest;
    if (role && role.comparePositionTo(botHighest) >= 0 && !role.managed) {
      message.channel.send(
        `${message.member}, Please provide a valid role to add or use \`${commandPrefix}autorole remove\` to remove the autorole. ` +
          `*The bot must have a higher role than the role it is assigning!*`,
      );
      return;
    }

    let roleSnowflake;
    if (role) {
      roleSnowflake = role.id;
    }

    switch (method) {
      case 'set':
        // Set data
        guild.roleID = String(roleSnowflake);
        guild.delayTime = String(time);
        break;
      case 'remove':
        // Remove data
        guild.roleID = '';
        guild.delayTime = '0';
        await socket.app.database.edit('newMemberRole', [String(message.guild.id), guild.roleID, guild.delayTime]);
        message.channel.send(`${message.member}, I will no longer assign a role to new members!`);
        return;
      case 'status':
    }

    // Update database
    await socket.app.database.edit('newMemberRole', [String(message.guild.id), guild.roleID, guild.delayTime]);

    // Variables for response message
    let delay = false;
    let roleMention = false;

    // Determine whether there is a delay time
    if (Number(guild.delayTime)) {
      // Traslate from milliseconds to minutes and seconds
      delay = Number(guild.delayTime) / 1000;
      let minutes = Math.floor(delay / 60);
      let seconds = Math.round(delay % 60);
      delay = minutes > 1 ? `${minutes} minutes` : minutes > 0 ? `${minutes} minute` : '';
      delay =
        delay === ''
          ? seconds > 1
            ? `${seconds} seconds`
            : seconds > 0
            ? `${seconds} second`
            : ''
          : `${delay}${seconds > 1 ? ` and ${seconds} seconds` : seconds > 0 ? ` and ${seconds} second` : ''}`;
    }

    // Determine whether there is an auto role
    if (guild.roleID) {
      roleMention = `<@&${guild.roleID}>`;
    }

    message.channel.send(
      `Currently ${
        roleMention
          ? `assigning ${roleMention} to new members ${delay === '' ? `with ${delay} delay.` : 'immediately.'}`
          : 'not assigning any role to new members.'
      }`,
    );
  },
};