'use strict';

const requests = {};

requests.streamStart = require('./streamStart');
requests.streamStop = require('./streamStop');

module.exports = requests;
