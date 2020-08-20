'use strict';

exports.up = (db) => db.addColumn('log_human', 'updated_at', {
  type: 'timestamp', notNull: false, defaultValue: null,
});

exports.down = (db) => db.removeColumn('log_human', 'updated_at');
