'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, streamData) =>
  comp
    .setTitle(streamData.status)
    .setColor(Colors.BRIGHT_RED)
    .setAuthor(`${streamData.display_name}`, '', streamData.url)
    .setURL(streamData.url)
    .setThumbnail(streamData.logo)
    .addField('Category', streamData.game || 'No game', true)
    .addField('Followers', streamData.followers || 'Unknown', true)
    .setImage(streamData.profile_banner)
    .setTimestamp(Date.now());
