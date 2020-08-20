'use strict';

const { Collection } = require('discord.js');
const { parseZone } = require('moment');

const { usage } = require.main.require('./app/util/helpers');

module.exports = {
  usage: '<command>',
  aliases: ['?'],

  run(socket, message, [command]) {
    const { commandPrefix } = socket.app.options.discord;
    if (command) {
      if (command.charAt(0) === commandPrefix) {
        command = command.substring(1);
      }
    }

    const handler = command ? socket.commands.get(command.toLowerCase()) : null;
    const commands = handler ? new Collection([[command, handler]]) : socket.commands;

    const lines = commands
      .sort((va, vb, ka, kb) => +(ka > kb) || +(ka === kb) - 1)
      .map((item, name) => usage(item.usage, commandPrefix, name))
      .filter((line) => line)
      .join('\n\n');

    if (!lines) return;

    message.channel.send(`\`\`\`${lines}\`\`\``, { split: true }).catch((err) => {
      socket.app.log.out('error', module, err);
    });
  },
};
