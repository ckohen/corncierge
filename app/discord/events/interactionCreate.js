'use strict';

const message = require("../embeds/message");

module.exports = async (socket, interaction) => {
    // Check for handler
    const handler = socket.applicationCommands.get(interaction.commandName);

    if (!handler) return interaction.acknowledge();

    // Check for channel constraints
    if (handler.channel) {
        let valid = socket.app.settings.get(`discord_channel_${handler.channel}`).split(",");
        if (valid.includes(interaction.channel.id)) return;
    }
    
    // Check for role constraints
    if (handler.role && !interaction.member?.roles.cache.some((role) => role.name === handler.role)) {
        if (!interaction.member?.hasPermission(`MANAGE_ROLES`)) {
            return interaction.reply(`You do not have the appropriate roles to perform that action!`, { hideSource: true, ephemeral: true });
        }
    }
    // Check permissions
    if (handler.permissions && !message.member?.hasPermission(handler.permissions)) {
        return interaction.reply(`You do not have adequate permissions to perform that action!`, { hideSource:true, ephemeral: true });
    }

    // Handle command
    handler.run(socket, interaction, interaction.options);
};