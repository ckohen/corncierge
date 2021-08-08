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

  run(message) {
    const { discord, twitch, log, settings, streaming } = this.socket.app;
    const ircDisabled = this.socket.app.options.disableIRC;
    const twitchDisabled = this.socket.app.options.disableTwitch;

    log(module, 'Reload instruct received');

    // Clear cache
    cache.clear();

    // Reload application state
    Promise.all([
      this.socket.app.setSettings(),
      this.socket.app.setStreaming(),
      ircDisabled ? Promise.resolve('Twitch Disabled') : twitch.irc.setCache(),
      twitchDisabled ? Promise.resolve('Twitch Disabled') : twitch.auth.setCache(),
      discord.setCache(),
    ]).then(async () => {
      const md = (name, metric) => `**${metric}** ${plural(name, metric)}`;
      const response = [
        'Reload complete.',
        `>>> ${md('settings', settings.size)}`,
        md('streaming users', streaming.size),
        md('filters', ircDisabled ? 'N/A' : twitch.irc.cache.filters.size),
        md('commands', ircDisabled ? 'N/A' : twitch.irc.cache.commands.size),
        md('jokes', ircDisabled ? 'N/A' : twitch.irc.cache.jokes.length),
        md('music guilds', settings.get('discord_channel_music').split(',').length),
        md('total guilds', discord.cache.prefixes.size),
      ];

      await this.socket.driver.user.setActivity(this.socket.app.settings.get('discord_activity') || null, {
        type: this.socket.app.settings.get('discord_activity_type') || 'PLAYING',
      });

      message.channel.send(response.join('\n')).catch(err => {
        log.warn(module, err);
      });

      log(module, 'Reload complete');
    });
  }
}

module.exports = ReloadCommand;
