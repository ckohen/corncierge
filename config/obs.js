'use strict';

module.exports = {
  address: process.env.OBS_IP || 'localhost',
  port: process.env.OBS_PORT || '4444',
  password: process.env.OBS_PASSWORD || '',
};