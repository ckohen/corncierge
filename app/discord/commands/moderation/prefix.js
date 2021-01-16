'use strict';

const BaseCommand = require('../BaseCommand');

class PrefixCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'prefix',
      description: 'Allows server admins to change the prefix for all commands',
      permissions: 'MANAGE_GUILD',
      args: true,
    };
    super(socket, info);
  }

  async run(socket, message, args) {
    args = args.join(' ');

    if (args.indexOf('@') > -1 || args.indexOf('#') > -1) {
      return message.channel.send(`${message.member}, Please do not use discord mentionable charachters in your prefix (@ and #)`);
    }

    try {
      socket.prefixes.get(String(message.guild.id)).prefix = args;
      await socket.app.database.tables.prefixes.edit(String(message.guild.id), args);
    } catch (err) {
      socket.app.log.error(module, err);
      return message.channel.send(`${message.member}, There was an error changing the prefix!`);
    }

    return message.channel.send(`Prefix has been changed to \`${args}\``);
  }
}

module.exports = PrefixCommand;
