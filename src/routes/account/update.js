export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		const body = await c.req.json();

		if (Object.keys(body) > 3 || Object.keys(body) < 1) {
			return await util.error(c, 400, 'Permintaan gagal karena tidak ada data yang ingin diubah.');
		}

		let { fullName, email, currentPassword, newPassword } = body;
		if (email) email = email.toLowerCase();

		if (fullName && !util.validate.fullName(fullName)) {
			return await util.error(c, 400, 'Maaf, nama lengkap kamu terlalu panjang atau terlalu pendek.');
		}

		if (email && !util.validate.email(email)) {
			return await util.error(c, 400, 'Maaf, email kamu tidak valid, mohon cek kembali.');
		}

		if (currentPassword && !util.validate.password(newPassword)) {
			return await util.error(
				c, 400, 
				'Maaf, kata sandi kamu tidak memenuhi syarat.\nMinimal 8 karakter, mengandung 1 huruf besar, 1 huruf kecil, dan 1 simbol.'
			);
		}

		conn = await db.getConn();

		const accountId = (await db.session.get(conn, sessionId)).account_id;
		const account = await db.account.get.byEmail(conn, email);

		if (account && account.account_id !== accountId) {
			return await util.error(c, 400, 'Maaf, email ini tidak tersedia.');
		}


		let password = newPassword;
		if (password) {
			const currentHashedPassword = account.password;
			const isCurrentPasswordCorrect = await util.password.verify(currentHashedPassword, newPassword);

			if (!isCurrentPasswordCorrect) {
				return await util.error(c, 400, 'Maaf, kata sandi Anda yang sekarang salah.');
			}

			password = await util.password.hash(password);
		}

		await db.account.update({ conn, accountId, fullName, email, password });

		return c.text(null, 204);
	} catch(err) {
		if (err.message === 'Unexpected end of JSON input') {
			return await util.error(c, 400, 'Permintaan gagal karena tidak ada data yang ingin diubah.');
		}

		if (err.message.includes('Unexpected token')) {
			return await util.error(c, 400, 'Permintaan gagal karena data tidak valid.');			
		}

		console.error(err.stack);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba mengubah data akun.');
	} finally {
		if (conn) conn.release();
	}
}
