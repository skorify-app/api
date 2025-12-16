import 'dotenv/config';
import { Hono } from 'hono'
import { serve } from '@hono/node-server';

import * as db from './handlers/database.js';
import * as util from './handlers/util.js';
import * as route from './handlers/routes.js';

await db.init();
const pool = db.getPool();

const app = new Hono()
.get('/account/info', (c) => route.account.info(c, db, util))
.post('/account/login', (c) => route.account.login(c, db, util))
.delete('/account/logout', (c) => route.account.logout(c, db, util))
.post('/account/register', (c) => route.account.register(c, db, util))
.put('/account/update', (c) => route.account.update(c, db, util))

.get('/questions/get/:subtestId', (c) => route.questions.get(c, db, util))
.post('/questions/submit', (c) => route.questions.submit(c, db, util))

.get('/subtests', (c) => route.subtests.index(c, db, util))

.get('/session/validate', (c) => route.session.validate(c, db, util))

.get('/scores', (c) => route.scores.fetch(c, db, util))
.get('/scores/:scoreId', (c) => route.scores.detail(c, db, util))

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
