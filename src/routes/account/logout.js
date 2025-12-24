export default async(c, db) => {
	let conn;

	try {
		conn = await db.getConn();
		await db.session.remove(conn, c.req.sessionId);

		return c.text(null, 204);
	} catch(err) {
		console.error(err);
		return c.text(null, 500);
	} finally {
		if (conn) conn.release();
	}
}
