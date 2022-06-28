'use strict';

module.exports = (comp, avatar, member, tag, created, id) =>
  comp
    .setColor('GREEN')
    .setAuthor({ name: 'Member joined', iconURL: avatar })
    .setDescription(`${member} ${tag} (created ${created})`)
    .setFooter({ text: `ID: ${id}` });
