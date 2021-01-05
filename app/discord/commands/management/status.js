'use strict';

const cache = require('memory-cache');

const { humanBytes, humanDuration } = require.main.require('./app/util/helpers');

module.exports = {
  channel: 'console',

  run(socket, message) {
    const { twitch, settings } = socket.app;
    const { rss, heapUsed } = process.memoryUsage();

    const status = [
      `Uptime: **${humanDuration(process.uptime() * 1000)}**`,
      `Memory: **${humanBytes(rss)}** total, **${humanBytes(heapUsed)}** heap`,
      `State: **${settings.size}** settings, **${twitch.irc.filters.size}** filters, **${twitch.irc.commands.size}** commands`,
      `Cache: **${cache.size()}** items`,
    ];

    message.channel.send(status).catch(err => {
      socket.app.log.warn(module, err);
    });
  },
};
