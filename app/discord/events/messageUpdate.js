'use strict';

const { isGuild } = require('../../util/UtilManager').discord;

module.exports = async (socket, before, after) => {
  if (before.partial) {
    try {
      before = await before.fetch();
    } catch (err) {
      socket.app.log.verbose(module, `Could not get partial message:${err}`);
      return;
    }
  }
  if (after.partial) {
    try {
      await after.fetch();
    } catch (err) {
      socket.app.log.verbose(module, `Could not get partial message: ${err}`);
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
  if (isGuild(before.guild.id, 'platicorn', socket.app.settings)) {
    socket.sendWebhook('msgEdit', embed);
  } else if (before.guild.id === '756319910191300778') {
    socket.sendMessage('helpLogs', embed);
  }
};
