'use strict';

const { twitch } = require('../../util/UtilManager');

module.exports = (socket, from, user, message) => {
  const handle = twitch.handle(user);
  const embed = socket.app.discord.getEmbed('whisper', [handle, message]);

  /**
   * Emitted whenever the bot recieves a whisper on twitch
   * @event EventLogger#twitchWhisper
   * @param {MessageEmbed} embed The automatically generated embed for this whisper
   * @param {string} message The raw message recieved
   * @param {string} handle The handle of the user that sent this whisper
   */
  socket.app.eventLogger.emit('twitchWhisper', embed, message, handle);

  socket.app.log.debug(module, `Received whisper from ${handle}: ${message}`);
};
