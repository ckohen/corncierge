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
      const twitchUser = await this.socket.twitch.fetchUser({ userName: handler.target }).catch(err => this.socket.app.log.warn(module, err));
      if (!twitchUser) return false;

      id = Number(twitchUser.id);
      name = twitchUser.display_name;
    }

    const followData = await this.socket.twitch.follow(id, handler.channel.id).then(
      data => data?.data?.[0],
      err => this.socket.app.log.warn(module, err),
    );
    if (!followData || followData.followed_at == null) return false; // eslint-disable-line eqeqeq
    const age = moment(followData.followed_at).valueOf();
    handler.respond(util.constants.IRCResponders.followage(name, util.humanDate(age), util.relativeTime(age)));
    return true;
  }
}

module.exports = FollowageTwitchCommand;
