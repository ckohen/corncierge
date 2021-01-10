'use strict';

module.exports = (comp, queue) =>
  comp
    .setThumbnail(queue[0].thumbnail)
    .setColor('RANDOM')
    .addField('Now Playing:', queue[0].title || 'Unknown Title')
    .addField('Duration:', queue[0].duration || 'Unknown Duration')
    .setFooter(`Requested by ${queue[0].memberDisplayName}`, queue[0].memberAvatar);
