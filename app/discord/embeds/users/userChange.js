'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, type, member, before, after) =>
  comp
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(Colors.CYAN)
    .setTitle(member.user.tag)
    .addField(type, `${before} **=>** ${after}`)
    .setDescription(`${member}'s ${type} has been updated!`)
    .setTimestamp(Date.now());
