'use strict';

module.exports = (comp, member, prefix) =>
  comp
    .setColor('purple')
    .setTitle(`Role Manager (${prefix}makeme and ${prefix}makemenot)`)
    .setDescription(
      'This is a list of roles that users can add and remove from themselves, ' +
        `use \`${prefix}help rolemanager\` to see instructions for how to edit the role manager`,
    )
    .setFooter(`Requested by ${member.user.username}`);
