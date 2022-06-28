'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, category, user, duration) =>
  comp
    .setTitle('Thank You For The Fun Stream!')
    .setColor(Colors.TWITCH)
    .setAuthor({ name: `${user?.displayName}`, iconURL: `https://www.twitch.tv/${user?.login}` })
    .setThumbnail(user?.profileImageURL)
    .addField('OFFLINE', `Played ${category ?? 'No game'} ${duration}`, true)
    .setImage(user?.offlineImageURL)
    .setTimestamp(Date.now());
