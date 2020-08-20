/*
 * Database seeder
 */

'use strict';

/* eslint-disable no-console */

// Environment
require('dotenv').config();

const mysql = require('mysql2/promise');

const seeds = require('./seeds');
const { database } = require('./config');

// Run
async function main() {
  const connection = await mysql.createConnection(database);

  const insert = (table, values) => connection.query(
    `INSERT INTO \`${table}\` (name, value) VALUES ?`, [values],
  ).catch(console.error);

  const promises = [];

  Object.entries(seeds).forEach(([table, values]) => {
    promises.push(insert(table, values).then(() => {
      console.info(`Seeded: ${table}`);
    }));
  });

  Promise.all(promises).then(() => {
    connection.end();
  });
}

main();
