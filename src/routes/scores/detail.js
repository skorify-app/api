export default async(c, db, util) => {
	let conn;

	try {
		const scoreId = c.req.param('scoreId');
		const accountId = c.req.account.account_id;

		let score, recordedUserAnswers;
		let type = 'subtest';

		conn = await db.getConn();

		score = await db.score.get(conn, scoreId, accountId);
		if (!score) {
			type = 'umpb'
			score = await db.umpbScore.get(conn, scoreId, accountId);
		}

		if (!score.score) return c.json(null, 404);

		if (type === 'subtest') {
			recordedUserAnswers = await db.recordedAnswer.get(conn, scoreId);

			const subtest = (await db.subtest.get(conn)).find(x => x.subtest_id === score.subtest_id);
			score['name'] = subtest.subtest_name;
		} else {
			recordedUserAnswers = await db.umpbRecordedAnswer.get(conn, scoreId);
			score['name'] = 'Simulasi UMPB';
		}

		if (!recordedUserAnswers.length) return c.json(null, 404);

		let rawQuestions;
		if (type === 'subtest') {
			rawQuestions = await db.question.get.contents(conn, score.subtest_id, false);
		} else {
			const mappedId = recordedUserAnswers.map(x => parseInt(x.question_id));
			rawQuestions = await db.question.get.withIDs(conn, mappedId);
		}

		if (!rawQuestions || !rawQuestions.length) return c.json(null, 404);

		let usesrRecordedAnswers;
		if (type === 'subtest') {
			usesrRecordedAnswers = await db.recordedAnswer.get(conn, scoreId);
		} else {
			usesrRecordedAnswers = await db.umpbRecordedAnswer.get(conn, scoreId)
		}


		let questions = [];
		let answers = {
			correct: 0,
			incorrect: 0,
			empty: 0
		}

		for (let userAnswer of usesrRecordedAnswers) {
			const questionData = rawQuestions.find(x => x.question_id === userAnswer.question_id);

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

		score['questions'] = questions;
		score['answers'] = answers;

		return c.json(score, 200);
	} catch(err) {
		console.error(err);
		return c.json(null, 503);
	} finally {
		if (conn) conn.release();
	}
}
