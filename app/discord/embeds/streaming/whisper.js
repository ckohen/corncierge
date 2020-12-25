'use strict';

module.exports = (comp, from, message) => comp.setColor('purple').setTitle(`Whisper from ${from}:`).setDescription(message);
