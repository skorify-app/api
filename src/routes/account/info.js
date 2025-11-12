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

		delete validAccount.password;

		validAccount.role = (validAccount.role === 'ADMIIN') ? 'Admin' : 'Peserta';

		return c.json({ account: validAccount });
	} catch(err) {
		console.error(err.message);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}
