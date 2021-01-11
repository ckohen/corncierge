'use strict';

const cache = require('memory-cache');
const plural = require('pluralize');
const BaseCommand = require('../BaseCommand');

class ReloadCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'reload',
      channel: 'console',
    };
    super(socket, info);
  }

  run(socket, message) {
    const { discord, twitch, log, settings, streaming } = socket.app;
    const ircDisabled = !socket.app.options.disableIRC;

    log(module, 'Reload instruct received');

    // Clear cache
    cache.clear();

    // Reload application state
    Promise.all([
      socket.app.setSettings(),
      socket.app.setStreaming(),
      ircDisabled ? Promise.resolve('Twitch Disabled') : twitch.irc.setCache(),
      discord.setCache(),
    ]).then(async () => {
      const md = (name, metric) => `**${metric}** ${plural(name, metric)}`;
      const response = [
        'Reload complete.',
        `>>> ${md('settings', settings.size)}`,
        md('streaming users', streaming.size),
        md('filters', ircDisabled ? 'N/A' : twitch.irc.filters.size),
        md('commands', ircDisabled ? 'N/A' : twitch.irc.commands.size),
        md('jokes', ircDisabled ? 'N/A' : twitch.irc.jokes.length),
        md('music guilds', discord.musicData.size),
        md('total guilds', discord.prefixes.size),
      ];

      await socket.driver.user.setActivity(socket.app.settings.get('discord_activity') || null, {
        type: socket.app.settings.get('discord_activity_type') || 'PLAYING',
      });

      message.channel.send(response).catch(err => {
        log.warn(module, err);
      });

      log(module, 'Reload complete');
    });
  }
}

module.exports = ReloadCommand;
