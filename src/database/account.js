export const get = {
	byEmail: async(conn, email) => {
		return (await conn.query('SELECT * FROM accounts WHERE email = ?', [email]))[0];
	}
}