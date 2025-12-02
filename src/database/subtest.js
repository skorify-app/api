export const get = async(conn) => {
	return await conn.query('SELECT * FROM subtests;');
}