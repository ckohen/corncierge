module.exports = {
    name: 'color',
    description: 'color [The color from the predefined list of colors]',
    args: true,
    usage: '<color-role-name>',
    async run(socket, message, args) {
        args = args.join(' ');
        // "{<channelName1>":["<validRole1>", "<validRole2>", etc...] <channelName2>:["validRole1", "validRole2", etc...]}
        let channelName = {
            "role-call": ["neon green", "light green", "green", "dark purple", "purple", "reeses", "beige", "orange",
                "sky", "dark blue", "neon blue", "hot pink", "pink", "orchid", "light yellow", "yellow", "red", "redder", "remove"]
        };

        let colorSnowflakes = ['606592812812730535', '590430544190504960', '577416768944078857', '716163993466830868',
            '606592355742646282', '637497588681277451', '669715209115402261', '660328424287764480',
            '712577083322400770', '593666243140124674', '606592928306954250', '637497769149595660',
            '609806342026166442', '712150139367849994', '718309477849366598', '630587419720417290',
            '588450216500527114', '591837797359419395'];

        // If a role from a valid channel is typed in that channel add the role to the user
        if (channelName[message.channel.name]) {
            roleAssign(channelName[message.channel.name]);
        }
        else {
            message.delete(); // Delete the message
        }

        // Role manager
        async function roleAssign(validRoles) {

            let roleName = args.toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender 

            // If roleName is a valid role within the channel
            let rollAssigned = false;

            if (validRoles.indexOf(roleName) > -1) {
                await member.removeRoles(colorSnowflakes); // Remove all predefined colors *Does not remove specialty colors*
                if (roleName === "remove") {
                    message.channel.send(`Your color has been removed, ${member}`)

                    socket.app.log.out('info', module, 'Removed ' + member.user.username + "'s color");
                }
                else {
                    let role = message.guild.roles.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                    await member.addRole(role); // Add the role requested

                    socket.app.log.out('info', module, 'Changed ' + member.user.username + "'s color to " + role.name);

                    // Notify user of role addition
                    roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                    message.channel.send(`Your color has been changed to ${roleName}, ${member}`);
                }
                rollAssigned = true;
            }

            else { // If the role is invalid in the channel, notify user 

                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`${roleName} isn't a valid color, ${member}`);
                rollAssigned = false;
            }

            // deletes command and resopne messages after 3 seconds
            setTimeout(function () { message.channel.bulkDelete(2); }, 3000);

            return rollAssigned;
        }

    },
};