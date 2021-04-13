'use strict';

module.exports = (socket, message) => {
  if (message.partial) {
    socket.app.log.verbose(module, `Recieved partial message in delete event: ${message.id}`);
    return;
  }

  if (message.author.bot) {
    return;
  }

  if (message.content.length > 900) {
    message.content = '**Too long to show!**';
  }

  let embed = socket.getEmbed('messageRemove', [message, message.content]);

  /**
   * Emitted whenever a message is deleted. Does not emit for uncached messages
   * @event EventLogger#discordMessageDelete
   * @param {Message} message The deleted message
   * @param {MessageEmbed} embed The automatically generated embed for this message deletion
   */
  socket.app.eventLogger.emit('discordMessageDelete', message, embed);
};
