export const get = {
	one: async(conn, scoreId, accountId) => {
		return (
			await conn.query(
				'SELECT score, subtest_id FROM scores WHERE score_id = ? AND account_id = ?;',
				[scoreId, accountId]
			)
		)[0];
	},
	all: async(conn, accountId) => {
		return await conn.query('SELECT * FROM scores WHERE account_id = ?;', [accountId]);
	}
}

export const insert = async(conn, subtestId, accountId, score) => {
	return (await conn.query(
		'INSERT INTO scores(subtest_id, account_id, score) VALUES(?, ?, ?) RETURNING score_id;',
		[subtestId, accountId, score]
	))[0]['score_id'];
}
