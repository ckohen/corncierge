'use strict';

module.exports = (comp, avatar, member, tag, created, id) =>
  /* eslint-disable-next-line newline-per-chained-call */
  comp.setColor('GREEN').setAuthor('Member joined', avatar).setDescription(`${member} ${tag} (created ${created})`).setFooter(`ID: ${id}`);
