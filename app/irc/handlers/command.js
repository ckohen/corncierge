'use strict';

const util = require('../../util/UtilManager');

const commands = require('../commands');

module.exports = (socket, channel, user, row, update, args, isBroadcaster = false, isPrivileged = false, isVip = false) => {
  const hasArgsMod = isPrivileged && args.length > 0;
  const hasArgs = args.length > 0;
  const target = hasArgs ? args[0].replace(/^@/, '') : util.twitch.handle(user);

  const commandResponder = (message, mention = false) => {
    if (!message) return;
    row.count += 1;
    socket.say(
      channel,
      util.mentionable(
        isPrivileged && mention,
        target,
        util.format(message, {
          user: util.twitch.handle(user),
          touser: target,
          count: row.count,
          caster: socket.app.settings.get('app_operator'),
        }),
      ),
    );
    socket.app.database.tables.ircCommands.edit('count', row.id);
  };

  if (row.method !== null && typeof commands[row.method] === 'function') {
    commands[row.method](
      socket,
      response => {
        if (!response) return commandResponder(row.output);
        return commandResponder(response);
      },
      hasArgsMod,
      user,
      target,
      isBroadcaster,
      isPrivileged,
      isVip,
    );
    return;
  }

  if (row.restriction) {
    switch (row.restriction) {
      case 'broadcaster':
        if (!isBroadcaster) return;
        break;
      case 'moderator':
        if (!isPrivileged) return;
        break;
      case 'vip':
        if (!isPrivileged || !isVip) return;
        break;
      default:
    }
  }

  commandResponder(row.output, row.mention);
};
