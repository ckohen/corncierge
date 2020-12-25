'use strict';

module.exports = {
  colors: {
    aqua: 0x2ec6cc,
    gold: 0xffab32,
    delete: 0x01b8c3,
    twitch: 0x9146ff,
    live: 0xff0000,
    play: 0xe9f931,
    queue: 0xff7373,
    songSearch: 0xe9f931,
    videoEmbed: 0xe9f931,
    pink: 0xff0080,
    red: 0xff0000,
    orange: 0xff8000,
    yellow: 0xffff00,
    green: 0x00ff00,
    cyan: 0x00ffff,
    blue: 0x0080ff,
    purple: 0x8000ff,
  },
  token: process.env.DISCORD_TOKEN,
  options: {
    partials: ['MESSAGE', 'REACTION'],
  },
};
