'use strict';

exports.up = (db) => db.addColumn('log_human', 'moderator_id', {
  type: 'int', length: 11, unsigned: true, notNull: true,
});

exports.down = (db) => db.removeColumn('log_human', 'moderator_id');
