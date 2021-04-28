'use strict';

const reqObj = { requests: [], name: 'twitch' };

reqObj.requests.push(require('./auth'));

module.exports = reqObj;
