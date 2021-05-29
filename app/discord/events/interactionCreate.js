'use strict';

const { discord, constants } = require('../../util/UtilManager');

module.exports = (socket, interaction) => {
  // Check for handler
  let handler;
  if (interaction.isCommand()) {
    handler = socket.interactions.applicationCommands.get(interaction.commandName);
  }
  if (interaction.isMessageComponent()) {
    if (!verifyCustomId(interaction.customID, interaction.message.components)) {
      interaction.reply('You think you are sneaky huh, well, no such luck here!', { ephemeral: true });
      return;
    }
    const name = constants.ComponentFunctions[Number(interaction.customID.split(':')[0])];
    switch (interaction.componentType) {
      case 'BUTTON':
        handler = socket.interactions.buttonComponents.get(name);
        break;
    }
  }

  if (!handler) {
    interaction.reply('This interaction has no associated action! Please contact the developer if it is supposed to be doing something!', { ephemeral: true });
    return;
  }

  if (handler.requiresBot && !interaction.guild) {
    interaction.reply('This command does not work without a bot in the server or in DMs.', { ephemeral: true });
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
  handler.run(interaction, interaction.options ?? null);
};

function verifyCustomId(id, components) {
  if (!components) return true;
  const found = components.find(component => component.type === 1 && component.components.find(c => c.custom_id === id));
  if (found) return true;
  return false;
}
