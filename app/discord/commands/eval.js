'use strict';

/* eslint-disable-next-line no-unused-vars */
const util = require('util');

module.exports = {
  description: 'Evaluates code passed as string',
  guild: 'helpDesk',
  permissions: 'ADMINISTRATOR',
  usage: ['<eval string> (available bases are socket, message, util, and client)'],

  async run(socket, message, args) {
    /* eslint-disable-next-line no-unused-vars */
    const client = socket.driver;
    args = args.join(' ');
    if (args.includes('token')) {
      message.channel.send(`Error: Execution of command refused`);
      return;
    }
    let evaluated = eval(args);
    let cleaned = await clean(evaluated);
    message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
  },
};

function clean(text) {
  if (typeof text === 'string') {
    return text.replace(/` /g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
  }
  return text;
}
