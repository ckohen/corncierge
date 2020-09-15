'use strict';

module.exports = {
    permissions: 'MOVE_MEMBERS',
    description: 'Moves all members in your vc to another vc',
    args: true,
    usage: ['<string name of channel to move to>'],

    async run(socket, message, args) {

        // Check if voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply('Join a channel and try again');

        args = args.join(' ');

        // Check for new channel
        let newChannel = await message.member.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.toLowerCase() && channel.type === "voice");

        let confMsg;


        if (newChannel) {
            // Move members
            voiceChannel.members.forEach(member => {
                member.voice.setChannel(newChannel).catch((err) => {
                    socket.app.log.out('error', module, err);
                });
            });
            confMsg = await message.channel.send("Moving all voice members to " + args);
        } 
        else {
            confMsg = await message.reply(args + " is not a valid voice channel!");
        }
        message.delete()
        confMsg.delete({timeout: 3000});
    }
};