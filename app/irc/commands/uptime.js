'use strict';

const util = require('../../util/UtilManager');

module.exports = async (socket, callback) => {
  const uptime = await socket.app.twitch.fetchUptime().catch(() => callback('{caster} is not live!'));
  if (!uptime) return;
  callback(util.twitch.messages.uptime(util.relativeTime(uptime, 3)));
};
