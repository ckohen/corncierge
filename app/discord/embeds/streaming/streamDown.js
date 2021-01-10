'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, streamData, game, duration) =>
  comp
    .setTitle('Thank You For The Fun Stream!')
    .setColor(Colors.TWITCH)
    .setAuthor(`${streamData.display_name}`, '', streamData.url)
    .setThumbnail(streamData.logo)
    .addField('OFFLINE', `Played ${game} ${duration}`, true)
    .setImage(streamData.profile_banner)
    .setTimestamp(Date.now());
