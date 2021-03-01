'use strict';

const { discord } = require('../../util/UtilManager');

module.exports = async (socket, message) => {
  // Ignore bots
  if (message.author.bot) return;

  if (message.partial) {
    try {
      await message.fetch();
    } catch (err) {
      socket.app.log.verbose(module, `Could not get partial message: ${err}`);
      return;
    }
  }

  // React only in guild text channels
  if (message.channel.type !== 'text') return;

  const commandPrefix = socket.prefixes.get(String(message.guild.id)).prefix;

  // Check for commands
  if (!message.content.startsWith(commandPrefix)) return;

  // Separate arguments from command
  const args = message.content.slice(commandPrefix.length).trim().split(/\s+/g);
  const command = args.shift().toLowerCase();

  // Check for handler or aliases
  const handler = socket.commands.get(command) || socket.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

  if (!handler) return;

  // Check for guild constraints
  if (handler.guild && !discord.isGuild(message.guild.id, handler.guild, socket.app.settings)) return;

  // Check for channel constraints
  if (handler.channel && !discord.isChannel(message.channel.id, handler.channel, socket.app.settings)) return;

  // Check user
  if (handler.user && !discord.isUser(message.author.id, handler.user, socket.app.settings)) return;

  // Check for role constraints
  if (handler.role && !message.member.roles.cache.some(role => role.name === handler.role)) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      const errMsg = await message.channel.send(`You're not allowed to do that, ${message.author}.`).catch(err => {
        socket.app.log.warn(module, err);
      });
      discord.delayDelete(message, 3000);
      if (errMsg) discord.delayDelete(errMsg, 3000);
      return;
    }
  }

  // Check permissions
  if (handler.permissions && !message.member.permissions.has(handler.permissions)) {
    const errMsg = await message.channel.send(`You're not allowed to do that, ${message.author}.`).catch(err => {
      socket.app.log.warn(module, err);
    });
    discord.delayDelete(message, 3000);
    if (errMsg) discord.delayDelete(errMsg, 3000);
    return;
  }

  // Check arguments
  if (handler.args && !args[0]) {
    message.channel.send(`That command requires an argument, ${message.author}.`).catch(err => {
      socket.app.log.warn(module, err);
    });
    return;
  }

  // Handle command
  handler.run(socket, message, args);
};
