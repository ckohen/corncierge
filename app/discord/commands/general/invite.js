'use strict';

const BaseCommand = require('../BaseCommand');

class InviteCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'invite',
    };
    super(socket, info);
  }

  run(message) {
    message.channel.send(
      'Thank you for your interest in corncierge, you can add the bot and see more infomation at <https://www.corncierge.com> \n\n' +
        'and here is a direct invite link: \n' +
        '<https://discord.com/oauth2/authorize?client_id=745920843690803211&permissions=1073212534&scope=bot%20applications.commands>',
    );
  }
}

module.exports = InviteCommand;