export const get = async(conn, subtestId, forParticipant) => {
	let query = 'SELECT * FROM questions WHERE subtest_id = ?;';
	if (forParticipant) {
		query = 'SELECT question_id, question_text FROM questions WHERE subtest_id = ?;';
	}

	return await conn.query(query, [subtestId]);
}
