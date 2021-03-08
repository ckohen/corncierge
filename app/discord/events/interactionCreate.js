'use strict';

const message = require('../embeds/message');

module.exports = (socket, interaction) => {
  // Check for handler
  const handler = socket.applicationCommands.get(interaction.commandName);

  if (!handler) {
    interaction.reply('This command has no associated action! Please contact the developer if it is supposed to be doing something!', { ephemeral: true });
    return;
  }

  // Check for channel constraints
  if (handler.channel) {
    let valid = socket.app.settings.get(`discord_channel_${handler.channel}`).split(',');
    if (valid.includes(interaction.channel.id)) return;
  }

  // Check for role constraints
  if (handler.role && !interaction.member?.roles.cache.some(role => role.name === handler.role)) {
    if (!interaction.member?.permissions.has(`MANAGE_ROLES`)) {
      interaction.reply(`You do not have the appropriate roles to perform that action!`, { ephemeral: true });
      return;
    }
  }
  // Check permissions
  if (handler.permissions && !message.member?.permissions.has(handler.permissions)) {
    interaction.reply(`You do not have adequate permissions to perform that action!`, { ephemeral: true });
    return;
  }

  // Handle command
  handler.run(socket, interaction, interaction.options);
};
