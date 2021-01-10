'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, member, prefix) =>
  comp
    .setColor(Colors.DEEP_GOLD)
    .setTitle(`Color Manager (${prefix}color)`)
    .setDescription(
      'This is a list of color roles that users can assign themselves. It will automatically remove all other roles on the list. ' +
        `Use \`${prefix}help colormanager\` to see instructions for how to edit the role manager`,
    )
    .setFooter(`Requested by ${member.user.username}`);
