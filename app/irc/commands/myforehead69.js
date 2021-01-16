'use strict';

const TwitchCommand = require('./TwitchCommand');

class MyForehead69TwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'myforehead69',
    };
    super(socket, info);
  }

  /* eslint-disable max-len */
  run(handler) {
    handler.respond(
      'Ok I’m getting away from the odyssey community, you all are truly evil, eerily similar to the Nazis. Especially lucidityy. Everyone in the community is a degenerate. Chaospringle is 20 years old, obese and lives with his mom. Mitch_smo is an annoying weeb. These people make me scared for the future. And you, Lindsey, have NO redeeming qualities.',
    );
    handler.respond(
      'You’re not smart enough to get into a smart school, you suck at odyssey, I mean, you have had a 1:08 in odyssey after playing for a year. A YEAR. I got 1:08 in about 6 runs.',
    );
    handler.respond(
      'Nobody wants to watch a bad speedrunner with a bad personality. Your only career is going to be onlyfans. And you have so much potential. A beautiful young lady playing video games.',
    );
    handler.respond('And also, lucidityy definitely has a crush on you.');
    handler.respond('I’d recommend you have sex with him.');
    return Promise.resolve(true);
  }
}

module.exports = MyForehead69TwitchCommand;
