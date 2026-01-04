const requiredData = ['type', 'answers'];
const QUESTION_TYPES = [ 'subtest', 'umpb' ];
const MAX_SCORE = 1000;

export default async(c, db, util) => {
	let conn;

	try {
		const body = await c.req.json();
		print(body);

		if (!util.validate.body(requiredData, body)) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		const { type, answers } = body;

		if (!answers || !answers.length) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		if (!QUESTION_TYPES.includes(type)) {
			return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
		}

		if (type === 'subtest') {

			const intId = parseInt(body.subtestId);
			if (isNaN(intId) || intId < 0) return c.json({ error: '400 Bad Request' }, 400);

			conn = await db.getConn();

			const questions = await db.question.get.contents(conn, intId, false);
			const questionLen = questions.length;
			if (!questionLen) return await util.error(c, 400, 'Maaf, subtest tidak dtemukan.');

			// Counting the score
			const scorePerQuestion = MAX_SCORE / questionLen;
			let totalScore = 0;

			// user's valid answers (like no duplicate answers)
			let answerResults = [];

			// loop all user's answers
			for (let question of questions) {
				let questionId = question.question_id;

				// get the answer using filter by answer id
				let getAnswer = answers.filter(answer => answer.id === String(questionId));
				const len = getAnswer.length;

				// if the filtered answer is empty, set the answer label as null
				if (!len) {
					answerResults.push({ questionId, userAnswer: null  });
					continue;
				}

				// if the answer is duplicated
				if (len > 1) {
					return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
				}

				// the answer data
				const userAnswer = getAnswer[0];

				// the answer label
				const userAnswerLabel = userAnswer.answerLabel.toUpperCase();

				// put answer to the array of valid answers
				answerResults.push({ questionId, userAnswer: userAnswerLabel  });

				// the correct answer label
				const correctAnswer = question.answer;

				// if the user's answer label is equals with the correct answer label
				if (userAnswerLabel === correctAnswer) {
					// add score
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

		} else {

			conn = await db.getConn();

			const mappedId = answers.map(x => parseInt(x.id));
			const questions = await db.question.get.withIDs(conn, mappedId);
			const questionLen = questions.length;

			if (!questionLen) return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');

			// Counting the score
			const scorePerQuestion = MAX_SCORE / questionLen;
			let totalScore = 0;

			// user's valid answers (like no duplicate answers)
			let answerResults = [];

			// loop all user's answers
			for (let question of questions) {
				let questionId = question.question_id;

				// get the answer using filter by answer id
				let getAnswer = answers.filter(answer => answer.id === String(questionId));
				const len = getAnswer.length;

				// if the filtered answer is empty, set the answer label as null
				if (!len) {
					answerResults.push({ questionId, userAnswer: null  });
					continue;
				}

				// if the answer is duplicated
				if (len > 1) {
					return await util.error(c, 400, 'Maaf, data jawaban kamu tidak valid.');
				}

				// the answer data
				const userAnswer = getAnswer[0];

				// the answer label
				const userAnswerLabel = userAnswer.answerLabel.toUpperCase();

				// put answer to the array of valid answers
				answerResults.push({ questionId, userAnswer: userAnswerLabel  });

				// the correct answer label
				const correctAnswer = question.answer;

				// if the user's answer label is equals with the correct answer label
				if (userAnswerLabel === correctAnswer) {
					// add score
					totalScore += scorePerQuestion;
					continue;
				}
			}

			totalScore = Math.min(Math.round(totalScore), MAX_SCORE);
			const { account_id } = c.req.account;

			const scoreId = await db.umpbScore.insert(conn, account_id, totalScore);

			await conn.beginTransaction();
			await db.umpbRecordedAnswer.insert(conn, scoreId, answerResults);

			await conn.commit();

			return c.text(scoreId, 200);
		}
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
