'use strict';

const { discord } = require('../../util/UtilManager');

module.exports = (socket, interaction) => {
  // Check for handler
  let handler;
  switch (interaction.type) {
    case 2:
      handler = socket.interactions.applicationCommands.get(interaction.commandName);
  }

  if (!handler) {
    interaction.reply('This command has no associated action! Please contact the developer if it is supposed to be doing something!', { ephemeral: true });
    return;
  }

  // Check for channel constraints
  if (handler.channel && !discord.isChannel(interaction.channel?.id, handler.channel, socket.app.settings)) {
    interaction.reply('This command is restricted to a specific channel, please go rerun the command there!', { ephemeral: true });
    return;
  }

  // Check for role constraints
  if (handler.role && !interaction.member?.roles.cache.some(role => role.name === handler.role)) {
    if (!interaction.member?.permissions.has(`MANAGE_ROLES`)) {
      interaction.reply(`You do not have the appropriate roles to perform that action!`, { ephemeral: true });
      return;
    }
  }
  // Check permissions
  if (handler.permissions && !interaction.member?.permissions.has(handler.permissions)) {
    interaction.reply(`You do not have adequate permissions to perform that action!`, { ephemeral: true });
    return;
  }

  // Handle command
  handler.run(interaction, interaction.options);
};
