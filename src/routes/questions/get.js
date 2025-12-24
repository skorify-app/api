export default async(c, db, util) => {
	let conn;

	try {
		const subtestId = parseInt(c.req.param('subtestId'));
		if (isNaN(subtestId)) return await util.error(c, 400, 'Maaf, subtest tidak dtemukan.');

		conn = await db.getConn();

		const questions = await db.question.get.contents(conn, subtestId, true);
		if (!questions.length) return await util.error(c, 400, 'Maaf, subtest tidak dtemukan.');

		const shuffledQuestions = shuffleChoices(questions);

		for (let question of shuffledQuestions) {
			const choices = await db.choice.get(conn, question.question_id);
			question.choices = shuffleChoices(choices);
		}

		return c.json(shuffledQuestions);
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}

function shuffleChoices(choices) {
	const result = [...choices];

	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result;
}

