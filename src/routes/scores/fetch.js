export default async(c, db, util) => {
	let conn;

	try {
		conn = await db.getConn();
		const accountId = c.req.account.account_id;

		const scores = await db.allScore.get(conn, accountId);
		if (!scores.length) return c.json([]);

		const subtestList = await db.subtest.get(conn);

		let result = [];
		for (let rawScore of scores) {
			delete rawScore.account_id;
			delete rawScore.score;

			let type = 'subtest';

			let score = await db.score.get(conn, rawScore.score_id, accountId);
			if (!score) {
				type = 'umpb';
				score = await db.umpbScore.get(conn, rawScore.score_id, accountId);
			}

			if (!score) continue;

			score['id'] = rawScore.score_id;

			let name = subtestList.find(x => x.subtest_id === score.subtest_id)?.subtest_name;
			if (!name) name = 'Simulasi UMPB';

			score['name'] = name;

			score['recorded_at'] = util.convertTimestamp(score['recorded_at']);

			let formattedQuestions = [];

			// fetch wrong and correct answers
			let recordedAnswer;
			if (type === 'subtest') {
				recordedAnswer = await db.recordedAnswer.get(conn, score.id);
			} else {
				recordedAnswer = await db.umpbRecordedAnswer.get(conn, score.id);
			}

			// if the user answers aren't recoded, then this score is NOT valid (manually modified by someone)
			if (!recordedAnswer.length) break;

			let questions;
			if (type === 'subtest') {
				questions = await db.question.get.contents(conn, score.subtest_id, false);
			} else {
				const mappedId = recordedAnswer.map(x => parseInt(x.question_id));
				questions = await db.question.get.withIDs(conn, mappedId);
			}

			if (!questions.length) break;

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
