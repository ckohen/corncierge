'use strict';

/* eslint-disable-next-line no-unused-vars */
const util = require('util');
const BaseCommand = require('../BaseCommand');

class EvalCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'eval',
      description: 'Evaluates code passed as string',
      usage: ['<eval string> (available bases are socket, message, util, and client)'],
      guild: 'helpDesk',
      permissions: 'ADMINISTRATOR',
    };
    super(socket, info);
  }

  async run(socket, message, args) {
    /* eslint-disable-next-line no-unused-vars */
    const client = socket.driver;
    args = args.join(' ');
    if (args.toLowerCase().includes('token') || args.toLowerCase().includes('secret')) {
      message.channel.send(`Error: Execution of command refused`);
      return;
    }
    let evaluated = eval(args);
    let cleaned = await clean(evaluated);
    message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
  }
}

function clean(text) {
  if (typeof text === 'string') {
    return text.replace(/` /g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
  }
  return text;
}

module.exports = EvalCommand;
