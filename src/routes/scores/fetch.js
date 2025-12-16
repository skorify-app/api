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

		const scores = await db.score.get.all(conn, validAccount.account_id);
		if (!scores.length) return c.json([]);

		const subtestList = await db.subtest.get(conn);

		let result = [];
		for (let score of scores) {
			delete score.account_id;
			delete score.score;

			score['subtest_name'] = subtestList.find(x => x.subtest_id === score.subtest_id).subtest_name;

			score['recorded_at'] = util.convertTimestamp(score['recorded_at']);

			let formattedQuestions = [];

			// fetch wrong and correct answers
			const recordedAnswer = await db.recordedAnswer.get(conn, score.score_id);

			// if there is no questions, then this recoded scores is NOT valid
			const questions = await db.question.get.contents(conn, score.subtest_id, false);
			if (!questions.length) break;

			// if the user answers aren't recoded, then this score is NOT valid (manually modified by someone)
			if (!recordedAnswer.length) break;

			let [ correct, incorrect, empty ] = [0,0,0,0];

			for (let answer of recordedAnswer) {
				const questionId = answer.question_id;

				const userAnswer = answer.answer;
				const correctAnswer = questions
				.find(question => question.question_id === questionId)
				.answer;

				if (!userAnswer) {
					empty++;
				} else if (userAnswer === correctAnswer) {
					correct++;
				} else if (userAnswer !== correctAnswer) {
					incorrect++
				}
			}

			score['answers'] = {
				correct, incorrect, empty
			};

			delete score.subtest_id;

			result.push(score);
		}

		return c.json(result);
	} catch(err) {
		console.error(err);
		return c.json(null, 503);
	} finally {
		if (conn) conn.release();
	}
}
