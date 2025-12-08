export const get = {
	contents: async(conn, subtestId, forParticipant) => {
		let query = 'SELECT * FROM questions WHERE subtest_id = ?;';
		if (forParticipant) {
			query = 'SELECT question_id, question_text FROM questions WHERE subtest_id = ?;';
		}

		return await conn.query(query, [subtestId]);
	},

	total: async(conn, subtestId) => {
		return (await conn.query('SELECT COUNT(*) FROM questions WHERE subtest_id = ?;', [subtestId]))[0];
	}
}
