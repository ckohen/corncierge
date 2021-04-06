'use strict';

module.exports = {
  name: 'color',
  description: 'color [The color from the predefined list of colors]',
  usage: '<color-role-name>',
  async run(socket, interaction, args) {
    // Get the current guild from the colorManager
    let guild = socket.cache.colorManager.get(String(interaction.guild.id));

    // An array of snowflakes for all the available color roles to remove all color roles before assigning a new one
    let colorSnowflakes = guild.snowflakes.filter(id => interaction.guild.roles.resolve(id) !== null);

    // Set user to command sender
    let member = interaction.member;

    // Set role if it exists
    let roleID = args?.find(arg => arg.name === `color`)?.value;

    if (colorSnowflakes.includes(roleID) || typeof args === `undefined`) {
      // Remove all predefined colors *Does not remove specialty colors*
      await member.roles.remove(colorSnowflakes);
      if (typeof args === `undefined`) {
        interaction.reply(`Your color has been removed.`, { hideSource: true, ephemeral: true });
      } else {
        // Add the role requested
        const assigned = await member.roles.add(roleID).catch(() => false);
        if (!assigned) {
          interaction.reply(`I was unable to assign <@&${roleID}>, please contact a mod to ensure all permissions are adequate.`, {
            hideSource: true,
            ephemeral: true,
          });
        } else {
          // Notify user of role addition
          interaction.reply(`Your color has been changed t0o <@&${roleID}>.`, { hideSource: true, ephemeral: true });
        }
      }
    } else {
      // If the role is invalid, notify user
      interaction.reply(`<@&${roleID}> isn't a valid color role.`, { hideSource: true, ephemeral: true });
    }
  },
};
