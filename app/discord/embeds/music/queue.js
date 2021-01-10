'use strict';

const { Colors } = require('../../../util/Constants');

module.exports = (comp, queue) => comp.setColor(Colors.SALMON).setTitle(`Music Queue - ${queue.length} Songs Currently`);
