'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('jokes', {
  id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
  output: { type: 'string', length: 500, notNull: true, defaultValue: '' },
  created_at: { type: 'timestamp', notNull: false, defaultValue: null },
  updated_at: { type: 'timestamp', notNull: false, defaultValue: null },
  deleted_at: { type: 'timestamp', notNull: false, defaultValue: null },
});

exports.down = (db) => db.dropTable('jokes');
