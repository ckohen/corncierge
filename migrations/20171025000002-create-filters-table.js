'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('filters', {
  id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
  type: { type: 'boolean', unsigned: true, notNull: true },
  input: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  duration: { type: 'int', length: 6, unsigned: true, notNull: false, defaultValue: null },
  output: { type: 'string', length: 500, notNull: false, defaultValue: null },
  created_at: { type: 'timestamp', notNull: false, defaultValue: null },
  updated_at: { type: 'timestamp', notNull: false, defaultValue: null },
  deleted_at: { type: 'timestamp', notNull: false, defaultValue: null },
});

exports.down = (db) => db.dropTable('filters');
