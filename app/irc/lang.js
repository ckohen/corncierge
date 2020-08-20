'use strict';

module.exports = {
  followage(user, date, duration) {
    return `${user} has been following {caster} since ${date} (${duration})`;
  },

  uptime(duration) {
    return `{caster} has been live for ${duration}`;
  },
};
