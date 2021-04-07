'use strict';

const BaseCommand = require('../BaseCommand');

class CommandsCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'commands',
      usage: ['(add|edit) <command> <response>', 'rename <old> <new>', 'delete <command>', 'level <command> <lowest required user level>'],
      channel: 'commandManagement',
    };
    super(socket, info);
  }

  async run(message, args) {
    if (this.socket.app.options.disableIRC) {
      message.channels.send('Twitch is not enabled for this bot (this command should be disabled)').catch(err => {
        this.socket.app.log.warn(module, err);
      });
      return;
    }
    const routines = ['add', 'edit', 'rename', 'delete', 'level'];
    const levels = ['broadcaster', 'moderator', 'vip', 'everyone'];

    const [actionRaw, inputRaw, ...outputRaw] = args;
    const action = actionRaw ? actionRaw.toLowerCase() : null;
    const input = inputRaw ? inputRaw.trim() : null;
    outputRaw.forEach((chunk, index) => {
      if (chunk.startsWith('<') && chunk.endsWith('>')) {
        outputRaw[index] = chunk.split(':')[1];
      }
    });
    const output = outputRaw.length > 0 ? outputRaw.join(' ').trim() : null;

    const send = (content, mention = false) => {
      if (!content) return;
      const target = mention ? `, ${message.author}` : '';
      message.channel.send(`${content}${target}.`).catch(err => {
        this.socket.app.log.warn(module, err);
      });
    };

    const respond = content => send(content, true);

    if (!routines.includes(action)) {
      respond('Specify a valid subroutine');
      return;
    }
    if (!input) {
      respond('Provide a command name');
      return;
    }

    const command = this.socket.app.twitch.irc.cache.commands.get(input);

    if (command && command.locked) {
      respond("That command is locked and can't be modified");
      return;
    }

    let data = null;
    let method = null;
    let submethod = null;
    let failure = null;
    let success = null;

    switch (action) {
      // Add command
      case 'add':
        if (command) {
          respond('That command already exists');
          return;
        }
        if (!output) {
          respond('Provide a command response');
          return;
        }
        method = 'add';
        data = [input, output];
        success = `Command \`${input}\` added`;
        failure = "Couldn't add command. Please try again";
        break;
      // Edit command
      case 'edit':
        if (!command) {
          respond("That command doesn't exist. Try adding it");
          return;
        }
        if (!output || output === command.output) {
          respond('Provide an updated command response');
          return;
        }
        method = 'edit';
        submethod = 'output';
        data = [command.id, output];
        success = `Command \`${input}\` updated`;
        failure = "Couldn't edit command. Please try again";
        break;
      // Rename command
      case 'rename':
        if (!command) {
          respond("That command doesn't exist");
          return;
        }
        if (!output || output === command.input) {
          respond('Provide a new command name');
          return;
        }
        method = 'edit';
        submethod = 'rename';
        data = [command.id, output];
        success = `Command \`${input}\` renamed to \`${output}\``;
        failure = "Couldn't rename command. Please try again";
        break;
      // Delete command
      case 'delete':
        if (!command) {
          respond("That command doesn't exist");
          return;
        }
        method = 'delete';
        data = [command.id];
        success = `Command \`${input}\` deleted`;
        failure = "Couldn't delete command. Please try again";
        break;
      // Edit command level
      case 'level':
        if (!command) {
          respond("That command doesn't exist. Try adding it");
          return;
        }
        if (!output || output.toLowerCase() === command.restriction) {
          respond('Provide an updated user level requirenment');
          return;
        }
        if (!levels.includes(output)) {
          respond('Specify a valid user level');
          return;
        }
        method = 'edit';
        submethod = 'restriction';
        data = [command.id, output.toLowerCase()];
        success = `Command Level for \`${input}\` updated`;
        failure = "Couldn't edit command. Please try again";
        break;
      default:
        return;
    }

    if (!method || !data) return;

    try {
      if (method === 'edit') {
        await this.socket.app.database.tables.ircCommands[method](submethod, ...data);
      } else {
        await this.socket.app.database.tables.ircCommands[method](...data);
      }
    } catch (err) {
      this.socket.app.log.warn(module, err);
      respond(failure);
      return;
    }

    await this.socket.app.twitch.irc.cacheCommands();

    send(success);
  }
}

module.exports = CommandsCommand;
