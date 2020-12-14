'use strict';

module.exports = (comp, avatar, member, tag, created, id) => comp
  .setColor('green')
  .setAuthor('Member joined', avatar)
  .setDescription(`${member} ${tag} (created ${created})`)
  .setFooter(`ID: ${id}`);
