'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, member, prefix) =>
  comp
    .setColor(Colors.BRIGHT_PURPLE)
    .setTitle(`Role Manager (${prefix}makeme and ${prefix}makemenot)`)
    .setDescription(
      'This is a list of roles that users can add and remove from themselves, ' +
        `use \`${prefix}help rolemanager\` to see instructions for how to edit the role manager`,
    )
    .setFooter({ text: `Requested by ${member.user.username}` });
