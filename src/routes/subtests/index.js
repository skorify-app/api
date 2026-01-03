export default async(c, db, util) => {
	let conn;

	try {
		conn = await db.getConn();

		let result = [];
		let umpbQuestions = [];

		let subtests = await db.subtest.get(conn);
		if (subtests.length) {
			for (let subtest of subtests) {
				const totalQuestions = await db.question.get.total(conn, subtest.subtest_id);
				const intTotal = parseInt((totalQuestions)['COUNT(*)']);

				subtest['total_questions'] = intTotal;
				result.push(subtest);

				// Only 50% of the total questions per subtest will show up as questions on UMPB
				umpbQuestions.push({ name: subtest.subtest_name, amount: Math.round(intTotal / 2) });
			}
		}

		return c.json({ subtests: result, umpb: umpbQuestions });
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}