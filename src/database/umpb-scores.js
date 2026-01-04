export const get = async(conn, scoreId, accountId) => {
	return (
		await conn.query(
			'SELECT score, recorded_at FROM umpb_scores WHERE score_id = ? AND account_id = ?;',
			[scoreId, accountId]
		)
	)[0];
}

export const insert = async(conn, accountId, score) => {
	return (await conn.query(
		'INSERT INTO umpb_scores(account_id, score) VALUES(?, ?) RETURNING score_id;',
		[accountId, score]
	))[0]['score_id'];
}
