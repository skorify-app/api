const QUESTION_TYPES = [ 'subtest', 'umpb' ];

export default async(c, db, util) => {
	let conn;

	try {
		const type = c.req.query('type');
		if (!type) return await util.error(c, 400, 'Maaf, soal pertanyaan itu tidak dtemukan.');
		if (!QUESTION_TYPES.includes(type)) {
			return await util.error(c, 400, 'Maaf, soal pertanyaan itu tidak dtemukan.');
		}

		let questions;

		if (type === 'subtest') {
			let subtestId = c.req.query('subtest_id');
			if (!subtestId) return await util.error(c, 400, 'Maaf, subtes tidak dtemukan.');

			subtestId = parseInt(subtestId);
			if (isNaN(subtestId)) return await util.error(c, 400, 'Maaf, subtes tidak dtemukan.');

			conn = await db.getConn();

			const subtestQuestions = await db.question.get.contents(conn, subtestId, true);
			if (!subtestQuestions.length) {
				return await util.error(c, 400, 'Maaf, saat ini soal subtes tersebut tidak tersedia.');
			}

			for (let j of subtestQuestions) {
				j['subtest_id'] = subtestId;
			}

			const shuffledQuestions = shuffleArray(subtestQuestions);
			questions = await addChoicesAndImageData(shuffledQuestions, db, conn);
		} else {
			conn = await db.getConn();

			const subtestList = await db.subtest.get(conn);
			if (!subtestList.length) {
				return await util.error(c, 400, 'Maaf, saat ini soal UMPB tidak tersedia.');
			}

			const subtestIds = subtestList.map(subtest => subtest.subtest_id);

			const allQuestions = [];
			for (const subtestId of subtestIds) {
				const rawSubtestQuestions = await db.question.get.contents(conn, subtestId, true);

				const rawTotalQuestions = rawSubtestQuestions.length;
				if (!rawTotalQuestions) {
					allQuestions.push({ id: subtestId, questions: [] });
					continue;
				}

				const total = Math.round(rawTotalQuestions / 2);
				const shuffledQuestions = shuffleArray(rawSubtestQuestions);
				const slicedQuestions = shuffledQuestions.slice(0, total);

				allQuestions.push({ id: subtestId, questions: slicedQuestions });
			}

			const filteredQuestions = allQuestions.filter(x => x.questions.length > 0);

			for (let i of filteredQuestions) {
				for (let j of i.questions) {
					j['subtest_id'] = i.id;
				}
			}

			const mappedQuestions = filteredQuestions.flatMap(item => item.questions)
			questions = await addChoicesAndImageData(mappedQuestions, db, conn);
		}

		return c.json(questions);
	} catch(err) {
		console.error(err);
		return await util.error(c, 500, 'Maaf, terdapat kesalahan pada server.');
	} finally {
		if (conn) conn.release();
	}
}

async function addChoicesAndImageData(rawQuestions, db, conn) {
	let result = [...rawQuestions];

	for (let question of result) {
		const qId = question.question_id;

		const choices = await db.choice.get(conn, qId);
		const rawImage = await db.questionImages.get(conn, qId);

		const imageName = rawImage[0]?.image_name;

		question.choices = shuffleArray(choices);
		if (imageName) question.image = `${question.subtest_id}/${imageName}`;

		delete question.subtest_id;
	}

	return result;
}

function shuffleArray(values) {
	const result = [...values];

	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result;
}

