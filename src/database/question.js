export const get = {
	contents: async(conn, subtestId, forParticipant) => {
		let query = 'SELECT question_id, question_text, answer FROM questions WHERE subtest_id = ?;';
		if (forParticipant) {
			query = 'SELECT question_id, question_text FROM questions WHERE subtest_id = ?;';
		}

		return await conn.query(query, [subtestId]);
	},

	total: async(conn, subtestId) => {
		return (await conn.query('SELECT COUNT(*) FROM questions WHERE subtest_id = ?;', [subtestId]))[0];
	},

	withIDs: async(conn, ids) => {
		let query = 'SELECT * FROM questions WHERE question_id IN (x);';
		const placeholders = ids.map(() => '?').join(', ');

		query = query.replace('x', placeholders);

		return await conn.query(query, ids);
	}
}
