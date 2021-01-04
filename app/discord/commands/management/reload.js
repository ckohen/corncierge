'use strict';

const cache = require('memory-cache');
const plural = require('pluralize');

module.exports = {
  channel: 'console',

  run(socket, message) {
    const { discord, twitch, log, settings, streaming } = socket.app;

    log.out('info', module, 'Reload instruct received');

    // Clear cache
    cache.clear();

    // Reload application state
    Promise.all([socket.app.setSettings(), socket.app.setStreaming(), twitch.irc.setCache(), discord.setCache()]).then(async () => {
      const md = (name, metric) => `**${metric}** ${plural(name, metric)}`;
      const response = [
        'Reload complete.',
        `>>> ${md('settings', settings.size)}`,
        md('streaming users', streaming.size),
        md('filters', twitch.irc.filters.size),
        md('commands', twitch.irc.commands.size),
        md('jokes', twitch.irc.jokes.length),
        md('music guilds', discord.musicData.size),
        md('total guilds', discord.prefixes.size),
      ];

      await socket.driver.user.setActivity(socket.app.settings.get('discord_activity') || null, {
        type: socket.app.settings.get('discord_activity_type') || 'PLAYING',
      });

      message.channel.send(response).catch(err => {
        log.out('error', module, err);
      });

      log.out('info', module, 'Reload complete');
    });
  },
};
