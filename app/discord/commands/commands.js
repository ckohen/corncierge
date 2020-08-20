'use strict';

module.exports = {
  channel: 'commandManagement',
  usage: [
    '(add|edit) <command> <response>',
    'rename <old> <new>',
    'delete <command>',
    'level <command> <lowest required user level>'
  ],

  async run(socket, message, args) {
    const routines = ['add', 'edit', 'rename', 'delete', 'level'];
    const levels = ['broadcaster', 'moderator', 'vip', 'everyone'];

    const [actionRaw, inputRaw, ...outputRaw] = args;
    const action = actionRaw ? actionRaw.toLowerCase() : null;
    const input = inputRaw ? inputRaw.replace(/^[\W]+/g, '').trim() : null;
    const output = outputRaw.length > 0
      ? outputRaw.join(' ').replace(/^['"]+|['"]+$/g, '').trim() : null;

    const send = (content, mention = false) => {
      if (!content) return;
      const target = mention ? `, ${message.author}` : '';
      message.channel.send(`${content}${target}.`).catch((err) => {
        socket.app.log.out('error', module, err);
      });
    };

    const respond = (content) => send(content, true);

    if (!routines.includes(action)) return respond('Specify a valid subroutine');
    if (!input) return respond('Provide a command name');

    const prefixBool = (inputRaw.charAt(0) === "!");
    const prefix = prefixBool ? "!" : "";

    const command = socket.app.irc.commands.get(input + (prefixBool ? "-1" : "-0"));

    if (command && command.locked) {
      return respond('That command is locked and can\'t be modified');
    }

    let data = null;
    let method = null;
    let failure = null;
    let success = null;

    switch (action) {
      // Add command
      case 'add':
        if (command) return respond('That command already exists');
        if (!output) return respond('Provide a command response');

        method = 'addIrcCommand';
        data = [input, output, prefixBool ? 1 : 0];
        success = `Command \`${prefix}${input}\` added`;
        failure = 'Couldn\'t add command. Please try again';

        break;

      // Edit command
      case 'edit':
        if (!command) return respond('That command doesn\'t exist. Try adding it');
        if (!output || output === command.output) {
          return respond('Provide an updated command response');
        }

        method = 'editIrcCommand';
        data = [command.id, output];
        success = `Command \`${prefix}${input}\` updated`;
        failure = 'Couldn\'t edit command. Please try again';

        break;

      // Rename command
      case 'rename':
        if (!command) return respond('That command doesn\'t exist');
        if (!output || output === command.input) {
          return respond('Provide a new command name');
        }

        method = 'renameIrcCommand';
        data = [command.id, output];
        success = `Command \`${prefix}${input}\` renamed to \`${prefix}${output}\``;
        failure = 'Couldn\'t rename command. Please try again';

        break;

      // Delete command
      case 'delete':
        if (!command) return respond('That command doesn\'t exist');

        method = 'deleteIrcCommand';
        data = [command.id];
        success = `Command \`${prefix}${input}\` deleted`;
        failure = 'Couldn\'t delete command. Please try again';

        break;

      // Edit command level
      case 'level':
        if (!command) return respond('That command doesn\'t exist. Try adding it');
        if (!output || output.toLowerCase() === command.restriction) {
          return respond('Provide an updated user level requirenment');
        }

        if (!levels.includes(output)) {
          return respond('Specify a valid user level');
        }

        method = 'editIrcRestriction';
        data = [command.id, output.toLowerCase()];
        success = `Command Level for \`${prefix}${input}\` updated`;
        failure = 'Couldn\'t edit command. Please try again';

        break;
      default:
        return;
    }

    if (!method || !data) return;

    try {
      await socket.app.database[method](...data);
    } catch (err) {
      socket.app.log.out('error', module, err);
      return respond(failure);
    }

    await socket.app.irc.cacheCommands();

    return send(success);
  },
};
