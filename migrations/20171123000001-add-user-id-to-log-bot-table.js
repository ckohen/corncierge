'use strict';

exports.up = (db) => db.addColumn('log_bot', 'user_id', {
  type: 'int', length: 11, unsigned: true, notNull: true,
});

exports.down = (db) => db.removeColumn('log_bot', 'user_id');
