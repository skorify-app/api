import 'dotenv/config';
import { Hono } from 'hono'
import { serve } from '@hono/node-server';

import * as db from './handlers/database.js';
import * as util from './handlers/util.js';

import register from './routes/register.js';
import login from './routes/login.js';
import logout from './routes/logout.js';
import accountInfo from './routes/account-info.js';

const app = new Hono();
const pool = db.getPool();

app.post('/register', (c) => register(c, db, util));
app.post('/login', (c) => login(c, db, util));
app.delete('/logout', (c) => logout(c, db, util));
app.post('/account-info', (c) => accountInfo(c, db, util));

const server = serve({
  fetch: app.fetch,
  port: process.env.PORT ?? 3000,
});

process.on('SIGINT', async() => {
  await pool.end();
  console.log('All database connections closed successfully');

  server.close();

  process.exit(0);
});

process.on('SIGTERM', async() => {
  await pool.end();
  console.log('All database connections closed successfully');

  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    process.exit(0);
  })
});
