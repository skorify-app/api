export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		conn = await db.getConn();

		let result = [];

		let subtests = await db.subtest.get(conn);
		if (subtests.length) {
			for (let subtest of subtests) {
				const totalQuestions = await db.question.get.total(conn, subtest.subtest_id);
				subtest['total_questions'] = parseInt((totalQuestions)['COUNT(*)']);
				result.push(subtest);
			}
		}

		return c.json(result);
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}