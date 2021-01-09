'use strict';

module.exports = {
  charset: 'utf8mb4_unicode_ci',
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 3306,
  timezone: 'Z',
  user: process.env.DB_USERNAME,
};
