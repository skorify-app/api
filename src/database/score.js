export const get = {
	one: async(conn, scoreId, accountId) => {
		return (
			await conn.query(
				'SELECT score, subtest_id, recorded_at FROM scores WHERE score_id = ? AND account_id = ?;',
				[scoreId, accountId]
			)
		)[0];
	},
	all: async(conn, accountId) => {
		return (
			await conn.query(
				'SELECT score_id, score, subtest_id, recorded_at FROM scores WHERE account_id = ?;',
				[accountId]
			)
		);
	}
}

export const insert = async({ conn, subtestId, accountId, score }) => {
	let args = [subtestId, accountId, score];
	let query = 'INSERT INTO scores(subtest_id, account_id, score) VALUES(?, ?, ?) RETURNING score_id;';

	if (!subtestId) {
		query = 'INSERT INTO scores(subtest_id, account_id, score) VALUES(NULL, ?, ?) RETURNING score_id;';
		args = [accountId, score];
	}

	return (await conn.query(
		query, args
	))[0]['score_id'];
}
