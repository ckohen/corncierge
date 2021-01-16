'use strict';

const moment = require('moment');

const TwitchCommand = require('./TwitchCommand');
const util = require('../../util/UtilManager');

class FollowageTwitchCommand extends TwitchCommand {
  constructor(socket) {
    const info = {
      name: 'followage',
    };
    super(socket, info);
  }

  async run(handler, hasArgs) {
    let id = handler.user['user-id'];
    let name = util.twitch.handle(handler.user);
    if (hasArgs) {
      const twitchUser = await this.socket.app.twitch.fetchUser(handler.target).catch(err => this.socket.app.log.warn(module, err));
      if (!twitchUser || twitchUser.users.length === 0) return false;

      const obj = twitchUser.users[0];
      id = obj._id;
      name = obj.display_name || obj.name;
    }

    return this.socket.app.twitch
      .follow(id)
      .then(data => {
        if (data.created_at == null) return false; // eslint-disable-line eqeqeq
        const age = moment(data.created_at).valueOf();
        handler.respond(util.constants.IRCResponders.followage(name, util.humanDate(age), util.relativeTime(age)));
        return true;
      })
      .catch(err => {
        this.socket.app.log.warn(module, err);
        return false;
      });
  }
}

module.exports = FollowageTwitchCommand;
