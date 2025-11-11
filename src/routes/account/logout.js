export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		conn = await db.getConn();
		await db.session.remove(conn, sessionId);

		return c.text(null, 204);
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba keluar akun.');
	} finally {
		if (conn) conn.release();
	}
}
