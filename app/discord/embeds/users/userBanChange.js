'use strict';

module.exports = (comp, user, type, color) =>
  comp
    .setThumbnail(user.displayAvatarURL())
    .setColor(color)
    .setTitle('Ban list updated!')
    .addField(type, `<@${user.id}> - ${user.tag}`)
    .setTimestamp(Date.now());
