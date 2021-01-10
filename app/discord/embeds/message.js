'use strict';

module.exports = (comp, user, message) => comp.setColor('BLUE').setTitle('Message:').setDescription(`<${user}> ${message}`);
