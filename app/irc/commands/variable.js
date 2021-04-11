'use strict';

const TwitchCommand = require('./TwitchCommand');

class VariableTwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'variable',
    };
    super(socket, info);
  }

  async run(handler) {
    await this.socket.app.discord?.commands?.get('variables')?.run(handler, handler.args, 'twitch');
    return true;
  }
}

module.exports = VariableTwitchCommand;
