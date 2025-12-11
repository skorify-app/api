export const insert = async(conn, subtestId, accountId, score) => {
	return (await conn.query(
		'INSERT INTO scores(subtest_id, account_id, score) VALUES(?, ?, ?) RETURNING score_id;',
		[subtestId, accountId, score]
	))[0]['score_id'];
}
