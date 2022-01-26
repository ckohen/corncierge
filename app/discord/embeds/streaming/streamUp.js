'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, channel, followers) =>
  comp
    .setTitle(channel.title)
    .setColor(Colors.BRIGHT_RED)
    .setAuthor(`${channel.user?.displayName}`, '', `https://www.twitch.tv/${channel.name}`)
    .setURL(`https://www.twitch.tv/${channel.broadcaster_name}`)
    .setThumbnail(channel.user?.profileImageURL)
    .addField('Category', channel.category?.name ?? 'No game', true)
    .addField('Followers', followers || 'Unknown', true)
    .setTimestamp(Date.now());
