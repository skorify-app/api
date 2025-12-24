const requiredData = ['email', 'password'];

export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();

		if (!util.validate.body(requiredData, body)) {
			return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
		}

		let { email, password } = body;
		email = email.toLowerCase();

		if (!util.validate.email(email) || !util.validate.password(password)) {
			return await util.error(c, 400, 'Maaf, email atau password kamu salah.');
		}

		conn = await db.getConn();

		const account = await db.account.get.byEmail(conn, email);
		if (!account) {
			return await util.error(c, 400, 'Maaf, email atau password kamu salah.');
		}

		// if password is incorrect
		if (!(await util.password.verify(account.password, password))) {
			return await util.error(c, 400, 'Maaf, email atau password kamu salah.');
		}

		if (!util.validate.allowOnMobile(account.role)) {
			return await util.error(c, 400, 'Maaf, hanya akun peserta yang dapat masuk akun pada aplikasi ini.');
		}

		const sessionId = util.generate.sessionId();
		await db.session.insert(conn, sessionId, account.account_id);

		return c.json({ sessionId });
	} catch(err) {
		console.error(err.message);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
	} finally {
		if (conn) conn.release();
	}
}
