'use strict';

const { Collection } = require('discord.js');
const { usage } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

function splitMessage(text) {
  if (text.length <= 2_000) return [text];
  const splitText = text.split('\n');
  if (splitText.some(elem => elem.length > 2_000)) throw new RangeError('Cannot effectively split');
  const messages = [];
  let msg = '';
  for (const chunk of splitText) {
    if (msg && `${msg}\n${chunk}`.length > 2_000) {
      messages.push(msg);
      msg = '';
    }
    msg += `${msg ? '\n' : ''}${chunk}`;
  }
  return messages.concat(msg).filter(m => m);
}

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

  async run(message, [arg]) {
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

    const split = splitMessage(`\`\`\`${paginated.join('\n\n')}\`\`\``);
    for await (const content of split) {
      await message.channel.send(content).catch(err => {
        this.socket.app.log.warn(module, err);
      });
    }
  }
}

module.exports = CommandListCommand;
