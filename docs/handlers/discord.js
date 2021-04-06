'use strict';

/**
 * A way to add commands to the bot
 */

// Import the necessary elements
const { Application, BaseCommand, BaseAppCommand } = require('corncierge');

// Create an instance of the application, make sure to provide actual config options or this will fail
const app = new Application();

// Traditional text based command: test
// Create the structure of your command
class TestCommand extends BaseCommand {
  constructor(socket) {
    // Define the parameters of the command
    const commandDescriptor = {
      name: 'test',
      aliases: ['t'],
      description: 'a basic test command',
    };
    super(socket, commandDescriptor);
  }

  // The function that is called when the commandis run
  run(message, args) {
    // Use this.socket if you need to talk to the DiscordManager
    this.socket.app.log(module, 'Test command used!');
    message.channel.send(`That's a test....${args ? `with some args: ${args}` : ''}`);
  }
}

// Let the app know about your command
app.discord.commandManager.register(TestCommand);

// If you have a lot of commands you can register them all at once
const commands = [];
commands.push(TestCommand);
// If you register two commands with the same name (or register the same command twice) it overwrites the existing one
// If you do not disable a built in command with the same name, it will overwrite it!
app.discord.commandManager.registerGroup(commands, 'custom');

// Discord Slash Command: test
// Create the structure of your command
class TestApplicationCommand extends BaseAppCommand {
  constructor(socket) {
    // Define the parameters of the command
    const commandDescriptor = {
      definition: {
        name: 'test',
        description: 'A testing command',
        options: [
          {
            type: 3,
            name: 'string',
            description: 'a string option',
          },
        ],
      },
    };
    super(socket, commandDescriptor);
  }

  // The function that is called when the interaction is recieved
  run(interaction, args) {
    interaction.reply(`That's an interaction test....${args ? `with some args: ${args}` : ''}`, { ephemeral: true });
  }
}

// Let the app know about your command
app.discord.interactionManager.register(TestApplicationCommand, 'applicationCommands');

// If you have a lot of commands you can register them all at once
const applicationCommands = [];
applicationCommands.push(TestApplicationCommand);
// If you register two commands with the same name (or register the same command twice) it overwrites the existing one
// Built-in commands will be overwritten in this instance!
app.discord.interactionManager.registerMultiple(applicationCommands, 'applicationCommands');

// Start the app
app.boot();
