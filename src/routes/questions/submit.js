const requiredData = ['subtestId', 'answers'];
const MAX_SCORE = 1000;

export default async(c, db, util) => {
	let conn;

	try {
		const sessionId = c.req.header('Session');
		if (!sessionId || !util.validate.sessionId(sessionId)) {
			return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
		}

		const body = await c.req.json();

		if (!util.validate.body(requiredData, body)) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		conn = await db.getConn();

		const validAccount = await util.validate.account(db, conn, sessionId);
		if (validAccount.error) return await util.error(c, 400, validAccount.error);

		const { answers } = body;
		const subtestId = parseInt(body.subtestId);

		if (isNaN(subtestId)) return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');

		const questions = await db.question.get.contents(conn, subtestId, false);
		const questionLen = questions.length;

		if (!questionLen) return await util.error(c, 400, 'Maaf, subtest tidak dtemukan.');

		if (questionLen !== answers.length) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		const scorePerQuestion = MAX_SCORE / questionLen;
		let totalScore = 0;

		let answerResults = [];

		for (let question of questions) {
			let questionId = question.question_id;
			let userAnswer = answers.filter(answer => answer.id === String(questionId));

			// If the answer is duplicated
			if (userAnswer.length > 1) {
				if (!userAnswer) return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
			}

			userAnswer = userAnswer[0];

			if (!userAnswer) return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');

			let correctAnswer = question.answer;
			let userAnswerLabel = userAnswer.answerLabel;

			answerResults.push({ questionId, userAnswer: userAnswerLabel  });

			if (userAnswerLabel === correctAnswer) {
				totalScore += scorePerQuestion;
				continue;
			}
		}

		totalScore = Math.min(Math.round(totalScore), MAX_SCORE);
		const { account_id } = validAccount;

		const scoreId = await db.score.insert(conn, subtestId, account_id, totalScore);

		await conn.beginTransaction();
		await db.recordedAnswer.insert(conn, scoreId, answerResults);

		await conn.commit();
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
