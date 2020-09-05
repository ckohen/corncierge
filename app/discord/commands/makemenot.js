module.exports = {
	name: 'makemenot',
	description: 'makemenot [The role you would like to remove]',
    args: true,
    usage: '<role>',
	async run(socket, message, args) {
        args = args.join(' ');
        // "{<channelName1>":["<validRole1>", "<validRole2>", etc...] <channelName2>:["validRole1", "validRole2", etc...]}
        let channelName = {"role-call": ["kart gang", "golf bois", "vc gang", "among us lads"]};

        // if a role from a valid channel is typed in that channel remove the role from the user
        if (channelName[message.channel.name]) {
            roleAssign(channelName[message.channel.name]);
        }
        else {
            message.delete(); // delete the message
        }

        // Role manager
        function roleAssign(validRoles) {
            
            let roleName = args.toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender

            // If roleName is a valid role within the channel
            if (validRoles.indexOf(roleName) > -1) {

                let role = message.guild.roles.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                member.removeRole(role); // Remove the role requested

                socket.app.log.out('info', module, 'Removed ' + role.name + " from " + member.user.username);

                // Notify user of role removal
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`You no longer have the role ${roleName}, ${member}`);
            }
            else { // If the role is invalid in the channel, notify user
                
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`${roleName} isn't a valid role, ${member}`);
            }
            
            // Delete command and response messages after 3 seconds
            setTimeout(function() {message.channel.bulkDelete(2);}, 3000);
        }
            
    },
};