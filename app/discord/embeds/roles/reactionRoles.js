'use strict';

module.exports = (comp, member, prefix = '!') =>
  comp
    .setColor('pink')
    .setTitle('Reaction Roles')
    .setDescription(
      'This is a list of reactions roles that users can assign themselves. They can also remove the role by removing their reaction. ' +
        `Use \`${prefix}help reactions\` to see instructions for how to edit the reactions.\n` +
        `Use \`${prefix}reactions create\` to create the message for users to react to.`,
    )
    .setFooter(`Requested by ${member.user.username}`);
