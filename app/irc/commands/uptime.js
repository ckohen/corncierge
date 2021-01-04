'use strict';

const helpers = require.main.require('./app/util/helpers');

const lang = require('../lang');

module.exports = async (socket, callback) => {
  const uptime = await socket.app.twitch.fetchUptime().catch(() => callback('{caster} is not live!'));
  if (!uptime) return;
  callback(lang.uptime(helpers.relativeTime(uptime, 3)));
};
