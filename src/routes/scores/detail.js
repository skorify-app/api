export default async(c, db, util) => {
	let conn;

	try {
		const scoreId = c.req.param('scoreId');
		const accountId = c.req.account.account_id;

		conn = await db.getConn();

		const score = await db.score.get.one(conn, scoreId, accountId);
		if (!score) return c.json(null, 404);

		const userAnswers = await db.recordedAnswer.get(conn, scoreId);
		if (!userAnswers) return c.json(null, 404);

		let scoreQuizName = 'Simulasi UMPB';
		if (score.subtest_id) {
			const subtest = (await db.subtest.get(conn)).find(x => x.subtest_id === score.subtest_id);
			scoreQuizName = subtest.subtest_name;
		}

		score['name'] = scoreQuizName;

		let rawQuestions;
		if (score.subtest_id) {
			rawQuestions = await db.question.get.contents(conn, score.subtest_id, false);
		} else {
			const mappedId = userAnswers.map(x => parseInt(x.question_id));
			rawQuestions = await db.question.get.withIDs(conn, mappedId);
		}

		if (!rawQuestions.length) return c.json(null, 404);

		let questions = [];
		let answers = {
			correct: 0,
			incorrect: 0,
			empty: 0
		}

		for (let userAnswer of userAnswers) {
			const questionData = rawQuestions.find(x => x.question_id === userAnswer.question_id);

			// if the answer's question data does not exist,
			// it means the question data was deleted previously
			if (!questionData) continue;

			let finalData = {};

			finalData['text'] = questionData.question_text;


			const questionId = questionData.question_id;

			const questionImage = await db.questionImages.get(conn, questionId);
			const subtestId = score.subtest_id ? score.subtest_id : questionData.subtest_id;
			if (questionImage.length) finalData['image'] = `${subtestId}/${questionImage[0]?.image_name}`;

			const correctAnswer = questionData.answer_label;
			finalData['correctAnswer'] = correctAnswer;

			const userAnswerLabel = userAnswer.answer;
			finalData['userAnswer'] = userAnswerLabel;

			const choices = await db.choice.get(conn, questionId);
			finalData['choices'] = choices;

			if (!userAnswerLabel) {
				answers.empty++;
			} else if (userAnswerLabel === correctAnswer) {
				answers.correct++;
			} else if (userAnswerLabel !== correctAnswer) {
				answers.incorrect++;
			}

			questions.push(finalData);
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
