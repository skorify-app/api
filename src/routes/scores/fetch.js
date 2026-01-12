export default async(c, db, util) => {
	let conn;

	try {
		conn = await db.getConn();
		const accountId = c.req.account.account_id;

		const scores = await db.score.get.all(conn, accountId);
		if (!scores.length) return c.json([]);

		const subtestList = await db.subtest.get(conn);

		let result = [];
		for (let rawScore of scores) {
			delete rawScore.account_id;
			delete rawScore.score;

			const score = await db.score.get.one(conn, rawScore.score_id, accountId);
			if (!score) continue;

			score['id'] = rawScore.score_id;

			let name = 'Simulasi UMPB';
			if (score.subtest_id) {
				name = subtestList.find(x => x.subtest_id === score.subtest_id)?.subtest_name;
			}

			score['name'] = name;
			score['recorded_at'] = util.convertTimestamp(score['recorded_at']);

			const userAnswers = await db.recordedAnswer.get(conn, score.id);
			if (!userAnswers.length) continue;

			let questions;
			if (score.subtest_id) {
				questions = await db.question.get.contents(conn, score.subtest_id, false);
			} else {
				const mappedId = userAnswers.map(x => parseInt(x.question_id));
				questions = await db.question.get.withIDs(conn, mappedId);
			}

			if (!questions.length) continue;

			let [ correct, incorrect, empty ] = [0,0,0];

			for (let answer of userAnswers) {
				const questionId = answer.question_id;

				const answerLabel = answer.answer_label;
				const correctAnswerLabel = questions
				.find(question => question.question_id === questionId)
				.answer;

				if (!answerLabel) {
					empty++;
				} else if (answerLabel === correctAnswerLabel) {
					correct++;
				} else if (answerLabel !== correctAnswerLabel) {
					incorrect++
				}
			}

			score['correct_answers'] = correct;
			score['incorrect_answers'] = incorrect;
			score['empty_answers'] = empty;

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
