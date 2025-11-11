export const get = async(conn, questionId) => {
	return await conn.query('SELECT label, choice_value FROM choices WHERE question_id = ?;', [questionId]);
}
