const requiredData = ['fullName', 'email', 'password'];

export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();

		if (!util.validate.body(requiredData, body)) {
			return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
		}

		let { fullName, email, password } = body;
		email = email.toLowerCase();

		if (!util.validate.fullName(fullName)) {
			return await util.error(c, 400, 'Maaf, nama kamu terlalu pendek atau panjang. Mohon cek kembali.');
		}

		if (!util.validate.email(email)) {
			return await util.error(c, 400, 'Maaf, alamat email kamu tidak valid. Mohon cek kembali.');
		}

		if (!util.validate.password(password)) {
			return await util.error(c, 400, 'Maaf, kata sandi kamu terlalu pendek atau panjang. Mohon cek kembali.');
		}

		conn = await db.getConn();

		const account = await db.account.get.byEmail(conn, email);
		if (account) {
			return await util.error(c, 400, 'Maaf, alamat email ini sudah terdaftar.');
		}

		const accountId = util.generate.accountId();
		const hashedPassword = await util.password.hash(password);
		await db.account.create(conn, accountId, fullName, email, hashedPassword);

		const sessionId = util.generate.sessionId();
		await db.session.insert(conn, sessionId, accountId);

		return c.json({ sessionId }, 201);
	} catch(err) {
		if (err.message !== 'Unexpected end of JSON input') console.error(err.message);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
	} finally {
		if (conn) conn.release();
	}
}
