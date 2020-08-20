'use strict';

module.exports = (comp, user, message) => comp
  .setColor('blue')
  .setTitle('Message:')
  .setDescription(`<${user}> ${message}`);
