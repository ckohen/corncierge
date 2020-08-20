'use strict';

/* eslint-disable object-curly-newline */

exports.up = (db) => db.createTable('log_bot', {
  id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
  filter_id: { type: 'int', length: 11, unsigned: true, notNull: true },
  action: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  user: { type: 'string', length: 255, notNull: true, defaultValue: '' },
  duration: { type: 'int', length: 6, unsigned: true, notNull: false, defaultValue: null },
  message: { type: 'text', notNull: true },
  created_at: { type: 'timestamp', notNull: false, defaultValue: null },
}).then(() => db.addForeignKey(
  'log_bot',
  'filters',
  'log_bot_filter_id_foreign',
  { filter_id: 'id' },
  { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
));

exports.down = (db) => db.dropTable('log_bot');
