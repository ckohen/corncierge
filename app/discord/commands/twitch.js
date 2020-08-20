'use strict';

const { Collection } = require('discord.js');

const { usage } = require.main.require('./app/util/helpers');

module.exports = {
  channel: 'commandManagement',
  usage: [
    '<command>',
    '<page>'
  ],
  aliases: ['twitchlist', 'twitch-list', 'twitch-commands', 'list-commands', 'command-list', 'irc-commands'],

  run(socket, message, [arg]) {
    let command;
    let page;
    if (arg) {
      if (Number(arg)) {
        page = Number(arg);
      }
      else if (arg.charAt(0) === "!") {
        command = arg.slice(1) + "-1";
      }
      else {
        command = arg + "-0";
      }
    }

    const row = command ? socket.app.irc.commands.get(command) : null;
    const commands = row ? new Collection([[command, row]]) : socket.app.irc.commands;

    let lines = commands
      .sort((va, vb, ka, kb) => +(ka > kb) || +(ka === kb) - 1)
      .map((item, name) => usage(false, Number(item.prefix) ? "!" : "", item.input + " => " + item.output))
      .filter((line) => line);

    let pages = Math.ceil(lines.length / 15);

    if (page) {
      if (page < 1) {
        page = 1;
      }
      else if (page > pages) {
        page = pages;
      }
    }
    else {
      page = 1;
    }

    if (!lines) return;

    let paginated = lines.slice((page - 1) * 15, page * 15);

    paginated.unshift("Twitch Commands")
    paginated.push("Page " + page + "/" + pages);

    paginated.join('\n\n');

    message.channel.send(`\`\`\`${paginated.join('\n\n')}\`\`\``, { split: true }).catch((err) => {
      socket.app.log.out('error', module, err);
    });
  },
};