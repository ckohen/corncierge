'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('commands', {
  id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
  input: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  mention: { type: 'boolean', unsigned: true, notNull: true, defaultValue: 0 },
  method: { type: 'string', length: 255, notNull: false, defaultValue: null },
  output: { type: 'string', length: 500, notNull: false, defaultValue: null },
  locked: { type: 'boolean', unsigned: true, notNull: true, defaultValue: 0 },
  prefix: {type: 'boolean', unsigned: true, notNull: true, defaultValue: 1},
  count: {type: `bigint`, unsinged: true, notNUll: true, defaultValue: 0},
  restriction: {type: 'string', length: 65, notNull: false, defaultValue: 'everyone'},
  created_at: { type: 'timestamp', notNull: false, defaultValue: null },
  updated_at: { type: 'timestamp', notNull: false, defaultValue: null },
  deleted_at: { type: 'timestamp', notNull: false, defaultValue: null },
});

exports.down = (db) => db.dropTable('commands');
