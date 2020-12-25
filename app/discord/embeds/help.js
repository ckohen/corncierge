'use strict';

module.exports = (comp, prefix) =>
  comp
    .setColor('red')
    .setTitle('Hello, Corncierge Speaking, how can I help you today?')
    .setDescription(`If a command is not listed here, see the full help for that command by using \`${prefix}help legacy <command>\``);
