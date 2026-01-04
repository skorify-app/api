export const get = async(conn, accountId) => {
	return await conn.query('SELECT * FROM AllScores WHERE account_id = ?;', [accountId]);
}
