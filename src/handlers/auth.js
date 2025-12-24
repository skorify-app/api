import { createMiddleware } from 'hono/factory'
import * as util from './util.js';
import * as db from './database.js';

const auth = createMiddleware(async(c, next) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, terjadi kesalahan, silakan masuk akun ulang.');
		}

		conn = await db.getConn();

		const accountExist = await util.validate.account(db, conn, sessionId);
		if (accountExist.error) return await util.error(c, 400, accountExist.error);

		if (accountExist.role !== 'PARTICIPANT') {
			return await util.error(c, 400, 'Maaf, hanya peserta yang dapat menggunakan fitur aplikasi mobile Skorify.');
		}

		c.req.sessionId = sessionId;
		c.req.account = accountExist;

		await next();
	} catch(err) {
		return c.json({ error: 'Maaf, terjadi kesalahan pada sistem.' }, 500);
	} finally {
		if (conn) conn.release();
	}
});

export default auth;