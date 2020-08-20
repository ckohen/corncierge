'use strict';

module.exports = (comp, avatar, member, tag, id) => comp
  .setColor('yellow')
  .setAuthor('Member left', avatar)
  .setDescription(`${member} ${tag}`)
  .setFooter(`ID: ${id}`);
