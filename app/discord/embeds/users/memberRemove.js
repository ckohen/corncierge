'use strict';

module.exports = (comp, avatar, member, tag, id) =>
  comp
    .setColor('YELLOW')
    .setAuthor({ name: 'Member left', iconURL: avatar })
    .setDescription(`${member} ${tag}`)
    .setFooter({ text: `ID: ${id}` });
