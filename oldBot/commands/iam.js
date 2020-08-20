// TODO create a welcome message in the onboarding channel that directs user to use the command !iam <baseRole> and go to <welcomeChannel in discord

module.exports = {
	name: 'iam',
	description: 'iam [The role you would like to add]',
    args: true,
    usage: '<role>',
	execute(message, args) {
        // "{<channelName1>":["<validRole1>", "<validRole2>", etc...] <channelName2>:["validRole1", "validRole2", etc...]}
        let channelName = {"welcome": ["member"], "role-assign": ["stream", "vod"]};

        // If a role from a valid channel is typed in that channel add the role to the user
        if (channelName[message.channel.name]) {

            if(roleAssign(channelName[message.channel.name]) && message.channel.name === "welcome") {
            let member = message.member;
            let welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "general");
            welcomeChannel.send(`Hi there ${member} and welcome to the server! Go check out ${member.guild.channels.cache.find(channel => channel.name === 'role-assign')} to add some more cool roles that do cool things!`);
            
            }
        }
        else {
            message.delete(); // Delete the message
        }

        // Role manager
        function roleAssign(validRoles) {
        
            let roleName = args[0].toLowerCase(); // Convert role request to lower case for comparison
            let member = message.member; // Set user to command sender 

            // If roleName is a valid role within the channel
            let rollAssigned = false;

            if (validRoles.indexOf(roleName) > -1) {

                let role = message.guild.roles.cache.find(roles => roles.name.toLowerCase() === roleName.toLowerCase()); // Find the role within the discord server
                member.roles.add(role); // Add the role requested

                // Notify user of role addition
                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`You now have the role ${roleName}, ${member}`);
                rollAssigned = true;
            }
            
            else { // If the role is invalid in the channel, notify user 

                roleName = roleName.charAt(0).toUpperCase() + roleName.substring(1);
                message.channel.send(`${roleName} isn't a valid role, ${member}`);
                rollAssigned = false;
            }
            
            // deletes command and resopne messages after 3 seconds
            setTimeout(function() {message.channel.bulkDelete(2);}, 3000);

            return rollAssigned;
        }
            
    },
};