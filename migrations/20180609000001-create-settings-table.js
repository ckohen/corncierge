'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('settings', {
  name: { type: 'string', length: 255, notNull: true, primaryKey: true },
  value: { type: 'string', length: 255, notNull: true, defaultValue: '' },
});

exports.down = (db) => db.dropTable('settings');
