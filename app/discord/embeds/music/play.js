'use strict';

module.exports = (comp, data) =>
  comp
    .setThumbnail(data.thumbnail)
    .setColor('RANDOM')
    .addField('Now Playing:', data.title || 'Unknown Title')
    .addField('Duration:', data.duration || 'Unknown Duration')
    .setFooter(`Requested by ${data.memberDisplayName}`, data.memberAvatar);
