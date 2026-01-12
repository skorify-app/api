const requiredData = ['type', 'answers'];
const QUESTION_TYPES = [ 'subtest', 'umpb' ];
const MAX_SCORE = 1000;

export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();
		const { type, answers } = body;
		let subtestId = body.subtestId;

		if (!answers || !answers.length) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		if (!QUESTION_TYPES.includes(type)) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		if (subtestId) {
			const intId = parseInt(subtestId);
			if (isNaN(intId) || intId < 0) return c.json({ error: '400 Bad Request' }, 400);
			subtestId = intId;
		}



		conn = await db.getConn();

		let questions;
		if (subtestId) {
			questions = await db.question.get.contents(conn, subtestId, false);
		} else {
			const mappedId = answers.map(x => parseInt(x.id));
			questions = await db.question.get.withIDs(conn, mappedId);
		}

		const questionLen = questions.length;
		if (!questionLen) {
			return await util.error(c, 400, `Maaf, data ${subtestId ? 'subtes' : 'UMPB'} tidak ditemukan`);
		}


		const scorePerQuestion = MAX_SCORE / questionLen;
		let totalScore = 0;


		// user's valid answers (example: no duplicate answers)
		let validAnswers = [];

		for (let question of questions) {
			const questionId = question.question_id;
			const rawUserAnswer = answers.filter(answer => answer.id === String(questionId));

			if (!rawUserAnswer.length) {
				validAnswers.push({ questionId, userAnswer: null  });
				continue;
			}

			if (rawUserAnswer.length > 1) {
				return await util.error(c, 400, 'Maaf, ada jawaban kamu ada yang terduplikat. Silakan coba kerjakan kembali.');
			}


			const userAnswer = rawUserAnswer[0];
			const userAnswerLabel = userAnswer.answerLabel.toUpperCase();
			validAnswers.push({ questionId, userAnswer: userAnswerLabel  });


			const correctAnswer = question.answer_label;
			if (userAnswerLabel === correctAnswer) totalScore += scorePerQuestion;
		}


		totalScore = Math.min(Math.round(totalScore), MAX_SCORE);


		const { account_id: accountId } = c.req.account;
		const scoreId = await db.score.insert({ conn, subtestId, accountId, score: totalScore });

		await conn.beginTransaction();
		await db.recordedAnswer.insert(conn, scoreId, validAnswers);
		await conn.commit();

		return c.text(scoreId, 200);
	} catch(err) {
		// almost two of these errors are generated because of
		// broken JSON data from client that has been tampered.
		if (err.message !== 'Unexpected end of JSON input' &&
			!err.message.startsWith('Expected ')) console.error(err.stack);

		if (conn) await conn.rollback();
		return await util.error(c, 500, 'Maaf, terdapat kesalahan saat memproses jawaban kamu.');
	} finally {
		if (conn) conn.release();
	}
}
