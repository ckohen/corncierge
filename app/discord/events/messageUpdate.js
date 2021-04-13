'use strict';

module.exports = async (socket, before, after) => {
  if (before.partial) {
    try {
      before = await before.fetch();
    } catch (err) {
      socket.app.log.verbose(module, `Could not get partial message`, err);
      return;
    }
  }
  if (after.partial) {
    try {
      await after.fetch();
    } catch (err) {
      socket.app.log.verbose(module, `Could not get partial message`, err);
      return;
    }
  }

  if (after.author.bot) {
    return;
  }

  if (before.content === after.content) {
    return;
  }

  if (before.content.length > 900) {
    before.content = '**Too long to show!**';
  }
  if (after.content.length > 400) {
    after.content = '**Too long to show!**';
  }

  let embed = socket.getEmbed('messageEdit', [after, before.content, after.content]);
  /**
   * Emitted whenever a message is updated - e.g. embed or content change.
   * @event EventLogger#discordMessageUpdate
   * @param {Message} oldMessage The message before the update
   * @param {Messaage} newMessage The message after the update
   * @param {MessageEmbed} embed The automatically generated embed for this message update
   */
  socket.app.eventLogger.emit('discordMessageUpdate', before, after, embed);
};
