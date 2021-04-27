'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, stream, user, duration) =>
  comp
    .setTitle('Thank You For The Fun Stream!')
    .setColor(Colors.TWITCH)
    .setAuthor(`${stream.user_name}`, '', `https://www.twitch.tv/${stream.user_login}`)
    .setThumbnail(user?.profile_image_url)
    .addField('OFFLINE', `Played ${stream.game_name} ${duration}`, true)
    .setImage(user?.offline_image_url)
    .setTimestamp(Date.now());
