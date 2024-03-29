'use strict';

const { discord, constants } = require('../../util/UtilManager');

module.exports = async (socket, interaction) => {
  // Check for handler
  let handler;
  if (interaction.isCommand()) {
    handler = socket.interactions.applicationCommands.get(interaction.commandName);
  }
  if (interaction.isMessageComponent()) {
    if (!verifyCustomId(interaction.customId, interaction.message.components)) {
      interaction.reply({ content: 'You think you are sneaky huh, well, no such luck here!', ephemeral: true });
      return;
    }
    const name = constants.ComponentFunctions[Number(interaction.customId.split(':')[0])];
    switch (interaction.componentType) {
      case 'BUTTON':
        handler = socket.interactions.buttonComponents.get(name);
        break;
    }
  }

  if (!handler) {
    interaction.reply({
      content: 'This interaction has no associated action! Please contact the developer if it is supposed to be doing something!',
      ephemeral: true,
    });
    return;
  }

  if (handler.requiresBot && !interaction.guild) {
    interaction.reply({ content: 'This command does not work without a bot in the server or in DMs.', ephemeral: true });
    return;
  }

  // Check for channel constraints
  if (
    handler.channel &&
    !discord.isChannel(interaction.channelId, handler.channel, socket.app.settings) &&
    !discord.isChannel(interaction.channel?.parentId, handler.channel, socket.app.settings)
  ) {
    interaction.reply({ content: 'This command is restricted to a specific channel, please go rerun the command there!', ephemeral: true });
    return;
  }

  // Check for role constraints
  if (handler.role && !interaction.member?.roles.cache.some(role => role.name === handler.role)) {
    if (!interaction.member?.permissions.has(`MANAGE_ROLES`)) {
      interaction.reply({ content: `You do not have the appropriate roles to perform that action!`, ephemeral: true });
      return;
    }
  }
  // Check permissions
  if (handler.permissions && !interaction.member?.permissions.has(handler.permissions)) {
    interaction.reply({ content: `You do not have adequate permissions to perform that action!`, ephemeral: true });
    return;
  }

  // Handle command
  try {
    await handler.run(interaction, interaction.options ?? null);
  } catch (err) {
    socket.app.log.warn(module, `Error occured during command call ${handler.name}`, err);
  }
};

function verifyCustomId(id, components) {
  if (!components) return true;
  const found = components.find(
    component => (component.type === 1 || component.type === 'ACTION_ROW') && component.components.find(c => (c.customId ?? c.custom_id) === id),
  );
  if (found) return true;
  return false;
}
