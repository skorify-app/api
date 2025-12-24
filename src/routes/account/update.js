export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();

		if (Object.keys(body) > 3 || Object.keys(body) < 1) {
			return await util.error(c, 400, 'Permintaan gagal karena tidak ada data yang ingin diubah.');
		}

		let { fullName, email, currentPassword, newPassword } = body;
		if (!fullName && !email && !currentPassword && !newPassword) {
			return await util.error(c, 400, 'Permintaan gagal karena tidak ada data yang ingin diubah.');
		}

		if (fullName && !util.validate.fullName(fullName)) {
			return await util.error(c, 400, 'Maaf, nama lengkap kamu terlalu panjang atau terlalu pendek.');
		}

		if (email) email = email.toLowerCase();
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

		const accountId = c.req.account.account_id;
		const accountWithNewEmail = await db.account.get.byEmail(conn, email);

		if (accountWithNewEmail && accountWithNewEmail.account_id !== accountId) {
			return await util.error(c, 400, 'Maaf, email ini tidak tersedia.');
		}


		let password = newPassword;
		if (password) {
			const currentHashedPassword = c.req.account.password;
			const isCurrentPassCorrect = await util.password.verify(currentHashedPassword, currentPassword);

			if (!isCurrentPassCorrect) {
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

		if (err.message.includes('Unexpected token') || err.message.includes('Expected double-quoted')) {
			return await util.error(c, 400, 'Permintaan gagal karena data tidak valid.');			
		}

		console.error(err.stack);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba mengubah data akun.');
	} finally {
		if (conn) conn.release();
	}
}
