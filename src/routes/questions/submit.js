const requiredData = ['subtestId', 'answers'];
const MAX_SCORE = 1000;

export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();

		if (!util.validate.body(requiredData, body)) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		const { answers } = body;
		const subtestId = parseInt(body.subtestId);

		if (isNaN(subtestId)) return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');

		conn = await db.getConn();

		const questions = await db.question.get.contents(conn, subtestId, false);
		const questionLen = questions.length;

		// If the questions are not found
		if (!questionLen) return await util.error(c, 400, 'Maaf, subtest tidak dtemukan.');

		const scorePerQuestion = MAX_SCORE / questionLen;
		let totalScore = 0;

		let answerResults = [];

		for (let question of questions) {
			let questionId = question.question_id;

			let getAnswer = answers.filter(answer => answer.id === String(questionId));
			const len = getAnswer.length;

			// If the answer is empty
			if (!len) {
				answerResults.push({ questionId, userAnswer: null  });
				continue;
			}

			// If the answer is duplicated
			if (len > 1) {
				return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
			}

			const userAnswer = getAnswer[0];
			const userAnswerLabel = userAnswer.answerLabel.toUpperCase();

			const correctAnswer = question.answer;

			answerResults.push({ questionId, userAnswer: userAnswerLabel  });

			if (userAnswerLabel === correctAnswer) {
				totalScore += scorePerQuestion;
				continue;
			}
		}

		totalScore = Math.min(Math.round(totalScore), MAX_SCORE);
		const { account_id } = c.req.account;

		const scoreId = await db.score.insert(conn, subtestId, account_id, totalScore);

		await conn.beginTransaction();
		await db.recordedAnswer.insert(conn, scoreId, answerResults);

		await conn.commit();

		return c.text(scoreId, 200);
	} catch(err) {
		// almost two of these errors are generated because of
		// broken JSON data from client that has been tampered.
		if (err.message !== 'Unexpected end of JSON input' &&
			!err.message.startsWith('Expected ')) console.error(err.message);

		if (conn) await conn.rollback();
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat memproses jawaban kamu.');
	} finally {
		if (conn) conn.release();
	}
}
