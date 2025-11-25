export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return c.text(null, 400);
		}

		conn = await db.getConn();
		await db.session.remove(conn, sessionId);

		return c.text(null, 204);
	} catch(err) {
		console.error(err);
		return c.text(null, 500);
	} finally {
		if (conn) conn.release();
	}
}
