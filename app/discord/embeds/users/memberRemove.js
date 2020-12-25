'use strict';

module.exports = (comp, avatar, member, tag, id) =>
  /* eslint-disable-next-line newline-per-chained-call */
  comp.setColor('yellow').setAuthor('Member left', avatar).setDescription(`${member} ${tag}`).setFooter(`ID: ${id}`);
