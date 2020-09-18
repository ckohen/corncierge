'use strict';

const plural = require('pluralize');
const cache = require('memory-cache');

module.exports = {
  channels: 'console',

  async run(socket, message) {
    const { irc, log, settings } = socket.app;

    log.out('info', module, 'Reload instruct received');

    // Clear cache
    cache.clear();

    // Reload application state
    Promise.all([
      socket.app.setSettings(),
      irc.setCache(),
    ]).then(async () => {
      const md = (name, metric) => `**${metric}** ${plural(name, metric)}`;
      const response = [
        'Reload complete.',
        `>>> ${md('settings', settings.size)}`,
        md('filters', irc.filters.size),
        md('commands', irc.commands.size),
        md('jokes', irc.jokes.length),
      ];

      await socket.driver.user.setActivity(socket.app.settings.get('discord_activity') || null, {type: socket.app.settings.get('discord_activity_type') || 'PLAYING'});

      
      message.channel.send(response).catch((err) => {
        log.out('error', module, err);
      });

      log.out('info', module, 'Reload complete');
    });
  },
};
