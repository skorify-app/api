export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		conn = await db.getConn();
		const sessionExists = await db.session.get(conn, sessionId);
		if (!sessionExists) {
			return c.json(null,  410);
		}

		const accountExists = await db.account.get.byId(conn, sessionExists.account_id);
		if (!accountExists) {
			return c.json(null,  410);
		}

		return c.json(null);
	} catch(err) {
		console.error(err);
		return c.json(null, 503);
	} finally {
		if (conn) conn.release();
	}
}