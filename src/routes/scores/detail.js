const QUESTION_TYPES = [ 'subtest', 'umpb' ];

export default async(c, db, util) => {
	let conn;

	try {
		const type = c.req.query('type');
		if (!QUESTION_TYPES.includes(type)) {
			return await util.error(c, 400, 'Maaf, data tidak ditemukan.');
		}

		const scoreId = c.req.param('scoreId');
		const accountId = c.req.account.account_id;

		let score, recordedUserAnswers;

		conn = await db.getConn();

		if (type === 'subtest') {
			score = await db.score.get(conn, scoreId, accountId);
			recordedUserAnswers = await db.recordedAnswer.get(conn, scoreId);

			const subtest = (await db.subtest.get(conn)).find(x => x.subtest_id === subtestId);
			score['name'] = subtest.subtest_name;
		} else {
			score = await db.umpbScore.get(conn, scoreId, accountId);
			recordedUserAnswers = await db.umpbRecordedAnswer.get(conn, scoreId);
			score['name'] = 'Simulasi UMPB';
		}

		if (!score.score) return c.json(null, 404);
		if (!recordedUserAnswers.length) return c.json(null, 404);

		let answers = {
			correct: 0,
			incorrect: 0,
			empty: 0
		}

		return c.json(score, 200);

		/*let score = await db.score.get.one(conn, scoreId, accountId);
		if (!score) return c.json(null, 404);

		const recordedUserAnswers = await db.recordedAnswer.get(conn, scoreId);
		if (!recordedUserAnswers.length) return c.json(null, 404);

		const subtestId = score.subtest_id;

		const subtest = (await db.subtest.get(conn)).find(x => x.subtest_id === subtestId);
		score['subtest_name'] = subtest.subtest_name;

		const recordedQuestions = await db.question.get.contents(conn, subtestId, false);

		let answers = {
			correct: 0,
			incorrect: 0,
			empty: 0
		}

		let questions = [];

		for (let userAnswer of recordedUserAnswers) {
			const questionData = recordedQuestions.find(x => x.question_id === userAnswer.question_id);

			// if the answer's question data does not exist,
			// it means the question data was deleted previously
			if (!questionData) continue;

			const questionId = questionData.question_id;
			const correctAnswer = questionData.answer;
			const userAnswerLabel = userAnswer.answer;
			const choices = await db.choice.get(conn, questionId);

			if (!userAnswerLabel) {
				answers.empty++;
			} else if (userAnswerLabel === correctAnswer) {
				answers.correct++;
			} else if (userAnswerLabel !== correctAnswer) {
				answers.incorrect++;
			}

			questions.push({
				text: questionData.question_text,
				correctAnswer,
				userAnswer: userAnswerLabel,
				choices
			});
		}

		score['answers'] = answers;
		score['questions'] = questions;

		return c.json(score);*/
	} catch(err) {
		console.error(err);
		return c.json(null, 503);
	} finally {
		if (conn) conn.release();
	}
}
