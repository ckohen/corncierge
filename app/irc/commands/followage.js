'use strict';

const moment = require('moment');

const util = require('../../util/UtilManager');

module.exports = (socket, callback, hasArgs, user, target) => {
  const followCall = (userId, handle) => {
    socket.app.twitch
      .follow(userId)
      .then(body => {
        if (body.created_at === null) return false;

        const age = moment(body.created_at).valueOf();

        return callback(util.twitch.messages.followage(handle, util.humanDate(age), util.relativeTime(age)));
      })
      .catch(err => {
        if (err.statusCode === 404 || err.statusCode === '404') {
          return callback();
        }

        socket.app.log.warn(module, err);
        return false;
      });
  };

  if (hasArgs) {
    const twitchUser = socket.app.twitch.fetchUser(target).catch(err => socket.app.log.warn(module, err));
    if (!twitchUser || twitchUser.users.length === 0) return false;

    const obj = twitchUser.users[0];
    const name = obj.display_name || obj.name;

    // eslint-disable-next-line no-underscore-dangle
    return followCall(obj._id, name);
  }

  return followCall(user['user-id'], util.twitch.handle(user));
};
