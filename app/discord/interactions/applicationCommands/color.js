module.exports = {
    name: 'color',
    description: 'color [The color from the predefined list of colors]',
    usage: '<color-role-name>',
    async run(socket, interaction, args) {
        // Get the current guild from the colorManager
        let guild = socket.colorManager.get(String(interaction.guild.id));

        // An array of snowflakes for all the available color roles to remove all color roles before assigning a new one
        let colorSnowflakes = guild.snowflakes;

        // Set user to command sender
        let member = interaction.member;

        // Set role if it exists
        let roleID = args?.find(arg => arg.name === `color`)?.value;

        if (colorSnowflakes.includes(roleID) || typeof args === `undefined`) {
            await member.roles.remove(colorSnowflakes); // Remove all predefined colors *Does not remove specialty colors*
            if (typeof args === `undefined`) {
                interaction.reply(`Your color has been removed, ${member}`, { hideSource: true, ephemeral: true });
            }
            else {
                await member.roles.add(roleID); // Add the role requested

                // Notify user of role addition
                interaction.reply(`Your color has been changed to <@&${roleID}>, ${member}`, { hideSource: true, ephemeral: true });
            }
        }

        else { // If the role is invalid in the channel, notify user 
            interaction.reply(`<@&${roleID}> isn't a valid color role, ${member}`, { hideSource: true, ephemeral: true });
        }

    },
};