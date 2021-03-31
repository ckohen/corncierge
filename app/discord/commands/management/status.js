'use strict';

const cache = require('memory-cache');
const { humanBytes, humanDuration } = require('../../../util/UtilManager');
const BaseCommand = require('../BaseCommand');

class StatusCommand extends BaseCommand {
  constructor(socket) {
    const info = {
      name: 'status',
      channel: 'console',
    };
    super(socket, info);
  }

  run(message) {
    const { discord, twitch, settings } = this.socket.app;
    const { rss, heapUsed } = process.memoryUsage();
    const ircDisabled = !this.socket.app.options.disableIRC;

    const status = [
      `Uptime: **${humanDuration(process.uptime() * 1000)}**`,
      `Memory: **${humanBytes(rss)}** total, **${humanBytes(heapUsed)}** heap`,
      `State: **${settings.size}** settings ${ircDisabled ? '' : `, **${twitch.irc.filters.size}** filters, **${twitch.irc.commands.size}** commands`}`,
      `Cache: **${cache.size()}** items`,
      `Servers: **${discord.prefixes.size}**`,
    ];

    message.channel.send(status).catch(err => {
      this.socket.app.log.warn(module, err);
    });
  }
}

module.exports = StatusCommand;
