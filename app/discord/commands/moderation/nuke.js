'use strict';

module.exports = {
  permissions: 'MOVE_MEMBERS',
  description: 'Disconnects all members in a channel',

  run(socket, message) {
    // Check if voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(`${message.member}, Join a channel and try again`);
      return;
    }

    // Unmute members
    voiceChannel.members.forEach(member => {
      member.voice.kick().catch(err => {
        socket.app.log.out('error', module, err);
      });
    });

    message.delete();
  },
};
