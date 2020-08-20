'use strict';

module.exports = (comp, user, message) => comp
  .setTitle('Message:')
  .setDescription(`<${user}> ${message}`);