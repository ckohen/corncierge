'use strict';

const CommandInteraction = require('./CommandInteraction');

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
};

const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

module.exports = (client, data) => {
  switch (data.type) {
    case InteractionType.PING:
      return {
        type: InteractionResponseType.PONG,
      };
    case InteractionType.APPLICATION_COMMAND: {
      let timedOut = false;
      let resolve;
      const directPromise = new Promise(r => {
        resolve = r;
      });

      const syncHandle = {
        acknowledge({ ephemeral }) {
          if (!timedOut) {
            resolve({
              type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              data: ephemeral ? { flags: 64 } : undefined,
            });
          }
        },
        reply(resolved) {
          if (timedOut) {
            return false;
          }
          resolve({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: resolved.data,
          });
          return true;
        },
      };

      const interaction = new CommandInteraction(client, data, syncHandle);

      /**
       * Emitted when an interaction is created.
       * @event Client#interactionCreate
       * @param {Interaction} interaction The interaction which was created.
       */
      client.emit('interactionCreate', interaction);

      return directPromise;
    }
    default:
      throw new RangeError('Invalid interaction data');
  }
};
