'use strict';

const TwitchCommand = require('./TwitchCommand');

class JokeTwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'joke',
    };
    super(socket, info);
  }

  run(handler) {
    const { jokes } = this.socket;

    if (!Array.isArray(jokes) || jokes.length === 0) return Promise.resolve(false);

    // Select a random joke from the top of the stack
    const heap = Math.floor(jokes.length / 4);
    const key = Math.floor(Math.random() * heap);
    const item = jokes[key];

    // Move the joke to the bottom of the stack
    jokes.splice(key, 1);
    jokes.push(item);

    this.socket.app.log.verbose(module, `Told joke: ${item.id}`);

    handler.respond(item.output);
    return Promise.resolve(true);
  }
}

module.exports = JokeTwitchCommand;
