'use strict';

const moderatorActions = require('./moderatorActions');

module.exports = (options) => [
  {
    topic: `chat_moderator_actions.${options.twitch.bot.id}.${options.twitch.channel.id}`,
    handler: moderatorActions,
  },
];
