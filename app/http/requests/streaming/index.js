'use strict';

const streamingRequests = [];

streamingRequests.push(require('./streamStart'));
streamingRequests.push(require('./streamStop'));

module.exports = streamingRequests;
