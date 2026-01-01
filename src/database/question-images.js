export const get = async(conn, questionId) => {
	return conn.query('SELECT image_name FROM question_images WHERE question_id = ?;', [questionId]);
}
