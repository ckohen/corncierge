'use strict';

const { Collection } = require('discord.js');
const { usage } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class CommandListCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'commandlist',
      aliases: ['cl', 'twitchlist', 'twitch-list', 'twitch-commands', 'list-commands', 'command-list', 'irc-commands'],
      usage: ['[command]', '[page]'],
      channel: 'commandManagement',
    };
    super(socket, info);
  }

  run(message, [arg]) {
    if (this.socket.app.options.disableIRC) {
      message.channels.send('Twitch is not enabled for this bot (this command should be disabled)').catch(err => {
        this.socket.app.log.warn(module, err);
      });
      return;
    }
    let command;
    let page;
    if (arg) {
      if (Number(arg)) {
        page = Number(arg);
      } else {
        command = `${arg}`;
      }
    }

    const row = command ? this.socket.app.twitch.irc.cache.commands.get(command) : null;
    const commands = row ? new Collection([[command, row]]) : this.socket.app.twitch.irc.cache.commands;

    let lines = commands
      .sort((va, vb, ka, kb) => +(ka > kb) || +(ka === kb) - 1)
      .map(item => usage(false, '', `${item.input} => ${item.output}`))
      .filter(line => line);

    let pages = Math.ceil(lines.length / 15);

    if (page) {
      if (page < 1) {
        page = 1;
      } else if (page > pages) {
        page = pages;
      }
    } else {
      page = 1;
    }

    if (!lines) return;

    let paginated = lines.slice((page - 1) * 15, page * 15);

    paginated.unshift('Twitch Commands');
    paginated.push(`Page ${page}/${pages}`);

    paginated.join('\n\n');

    message.channel.send(`\`\`\`${paginated.join('\n\n')}\`\`\``, { split: true }).catch(err => {
      this.socket.app.log.warn(module, err);
    });
  }
}

module.exports = CommandListCommand;
