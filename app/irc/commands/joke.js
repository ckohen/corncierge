'use strict';

module.exports = (socket, callback) => {
  socket.app.api.uptime(time => {
    const { jokes } = socket;

    if (!time) return false;
    if (!Array.isArray(jokes) || jokes.length === 0) return callback();

    // Select a random joke from the top of the stack
    const heap = Math.floor(jokes.length / 4);
    const key = Math.floor(Math.random() * heap);
    const item = jokes[key];

    // Move the joke to the bottom of the stack
    jokes.splice(key, 1);
    jokes.push(item);

    socket.app.log.out('debug', module, `Told joke: ${item.id}`);

    return callback(item.output);
  });
};
