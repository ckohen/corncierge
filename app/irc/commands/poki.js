'use strict';

const TwitchCommand = require('./TwitchCommand');

class PokiTwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'poki',
    };
    super(socket, info);
  }

  run(handler) {
    handler.respond('poki1 poki2');
    handler.respond('poki3 poki4');
    return Promise.resolve(true);
  }
}

module.exports = PokiTwitchCommand;
