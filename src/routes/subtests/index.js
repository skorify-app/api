export default async(c, db, util) => {
	let conn;

	try {
		conn = await db.getConn();

		let result = [];
		let umpb = {
			total: 0,
			duration: 0,
			questions: []
		}

		let subtests = await db.subtest.get(conn);
		if (subtests.length) {
			for (let subtest of subtests) {
				const totalQuestions = await db.question.get.total(conn, subtest.subtest_id);
				const intTotal = parseInt((totalQuestions)['COUNT(*)']);

				subtest['total_questions'] = intTotal;
				result.push(subtest);

				// Only 50% of the total questions per subtest will show up as questions on UMPB
				const amount = Math.round(intTotal / 2);
				umpb.total += amount;

				umpb.questions.push({ name: subtest.subtest_name, amount });
			}

			// 90 seconds per one question,
			// and yes, the duration is dynamic.
			umpb.duration = umpb.total * 90;
		}

		return c.json({ subtests: result, umpb });
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}