'use strict';

const util = require('util');
const BaseAppCommand = require('./BaseAppCommand');

class TestAppCommand extends BaseAppCommand {
  constructor(socket) {
    const info = {
      guilds: '788600861982588940',
      definition: getDefintion(),
    };
    super(socket, info);
  }

  run(interaction, args) {
    interaction.reply(`Recieved interaction options: \n\`\`\`js\n${util.inspect(args, { depth: 5 })}\`\`\``);
  }
}

module.exports = TestAppCommand;

// Command Structure
function getDefintion() {
  return {
    name: 'test',
    description: 'various tests',
    options: [
      {
        type: 1,
        name: 'argument',
        description: 'test with the string argument',
        options: [
          {
            type: 3,
            name: 'string',
            description: 'the argument',
          },
          {
            type: 4,
            name: 'int',
            description: 'the argument',
          },
          {
            type: 5,
            name: 'bool',
            description: 'the argument',
          },
          {
            type: 6,
            name: 'user',
            description: 'the argument',
          },
          {
            type: 7,
            name: 'channel',
            description: 'the argument',
          },
          {
            type: 8,
            name: 'role',
            description: 'the argument',
          },
        ],
      },
      {
        type: 1,
        name: 'choices',
        description: 'test with string or int choices',
        options: [
          {
            type: 3,
            name: 'string',
            description: 'the argument',
            choices: [
              {
                name: 'empty',
                value: '',
              },
              {
                name: 'filled',
                value: 'text',
              },
            ],
          },
          {
            type: 4,
            name: 'int',
            description: 'the integer choices',
            choices: [
              {
                name: 1,
                value: 1,
              },
              {
                name: 0,
                value: 0,
              },
            ],
          },
        ],
      },
    ],
  };
}
