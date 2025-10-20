import mariadb from 'mariadb';

import * as accountHandler from '../database/account.js';

const pool = mariadb.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONN_LIMIT ?? 10,
  connectTimeout: 5000
});

console.log('Database pool has been created.');

pool.on('acquire', (connection) => {
  console.log(`Connection ${connection.threadId} acquired from pool`);
});

pool.on('connection', (connection) => {
  console.log(`New connection ${connection.threadId} created in pool`);
});

pool.on('release', (connection) => {
  console.log(`Connection ${connection.threadId} released back to pool`);
});

export const getPool = function GetDatabasePool() {
  return pool;
}

export const getConn = function GetConnection() {
  return pool.getConnection();
}

export const account = accountHandler;
