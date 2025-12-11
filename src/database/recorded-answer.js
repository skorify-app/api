export const insert = async(conn, scoreId, answers) => {
	const prepare = await conn
	.prepare('INSERT INTO recorded_answers(score_id, question_id, answer) VALUES (?, ?, ?);');

	for (let answer of answers) {
		await prepare.execute([scoreId, answer.questionId, answer.userAnswer]);
	}

	prepare.close();
}
