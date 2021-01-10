'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, from, message) => comp.setColor(Colors.BRIGHT_PURPLE).setTitle(`Whisper from ${from}:`).setDescription(message);
