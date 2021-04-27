'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, channel, user, followers) =>
  comp
    .setTitle(channel.title)
    .setColor(Colors.BRIGHT_RED)
    .setAuthor(`${user?.display_name ?? channel.broadcaster_name}`, '', `https://www.twitch.tv/${channel.broadcaster_name}`)
    .setURL(`https://www.twitch.tv/${channel.broadcaster_name}`)
    .setThumbnail(user?.profile_image_url)
    .addField('Category', channel.game_name || 'No game', true)
    .addField('Followers', followers || 'Unknown', true)
    .setTimestamp(Date.now());
