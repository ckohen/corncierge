'use strict';

const helpers = require.main.require('./app/util/helpers');

const lang = require('../lang');

module.exports = (socket, callback) => {
  socket.app.api.uptime(time => {
    if (!time) return;
    callback(lang.uptime(helpers.relativeTime(time, 3)));
  });
};
