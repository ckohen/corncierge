'use strict';

const util = require('util');

module.exports = {
  name: 'test',
  description: 'tests various slash commands behavior',
  run(socket, interaction, args) {
    interaction.reply(`Recieved interaction options: \n\`\`\`js\n${util.inspect(args, { depth: 5 })}\`\`\``);
  },
};
