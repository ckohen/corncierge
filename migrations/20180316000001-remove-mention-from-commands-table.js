'use strict';

exports.up = (db) => db.removeColumn('commands', 'mention');

exports.down = (db) => db.addColumn('commands', 'mention', {
  type: 'boolean', unsigned: true, notNull: true, defaultValue: 0,
});
