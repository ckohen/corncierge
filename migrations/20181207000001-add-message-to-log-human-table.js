'use strict';

exports.up = (db) => db.addColumn('log_human', 'message', {
  type: 'text', notNull: false, defaultValue: null,
});

exports.down = (db) => db.removeColumn('log_human', 'message');
