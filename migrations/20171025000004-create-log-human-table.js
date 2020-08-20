'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('log_human', {
  id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
  action: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  user: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  moderator: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  duration: { type: 'int', length: 6, unsigned: true, notNull: false, defaultValue: null },
  reason: { type: 'string', length: 500, notNull: false, defaultValue: null },
  created_at: { type: 'timestamp', notNull: false, defaultValue: null },
});

exports.down = (db) => db.dropTable('log_human');
