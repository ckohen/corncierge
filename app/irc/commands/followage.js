'use strict';

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
      const twitchUser = await this.socket.twitch.driver.users.fetch({ logins: [handler.target] }).catch(err => this.socket.app.log.warn(module, err));
      if (!twitchUser) return false;

      id = twitchUser.id;
      name = twitchUser.displayName;
    }

    const followData = await handler.channel.user?.fetchFollower(id).catch(err => this.socket.app.log.warn(module, err));
    if (!followData || followData.createdTimestamp == null) return false; // eslint-disable-line eqeqeq
    handler.respond(util.constants.IRCResponders.followage(name, util.humanDate(followData.createdTimestamp), util.relativeTime(followData.createdTimestamp)));
    return true;
  }
}

module.exports = FollowageTwitchCommand;
