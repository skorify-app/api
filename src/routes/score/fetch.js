export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		conn = await db.getConn();
		const validAccount = await util.validate.account(db, conn, sessionId);
		if (validAccount.error) return await util.error(c, 400, validAccount.error);

		const scores = await db.score.get.all(conn, validAccount.account_id);

		return c.json(scores);
	} catch(err) {
		console.error(err);
		return c.json(null, 503);
	} finally {
		if (conn) conn.release();
	}
}
