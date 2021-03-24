'use strict';

/**
 * A way to add twitch command responders to the bot
 */

// Import the necessary elements
const { Application, TwitchCommand } = require('corncierge');

// Create an instance of the application, make sure to provide actual config options or this will fail
const app = new Application();

// Create the structure of your responder
class TestTwitchCommand extends TwitchCommand {
  constructor(socket) {
    // Define the parameters of the command
    const commandDescriptor = {
      name: 'test',
    };
    super(socket, commandDescriptor);
  }

  // The function that is called when the command responder is run
  run(handler, hasArgs) {
    this.socket.app.log(module, 'Test twitch command used!');
    handler.respond(`Whoa, nice useage of the command${hasArgs ? ', I see you are a mod ang can use arguments!' : '.'}`);
  }
}

// Let the app know about your command responder
app.twitch.irc.commandResponders.register(TestTwitchCommand);

// If you register two command responders with the same name (or register the same responder twice) it overwrites the existing one

// Start the app
app.boot();
