export const get = {
	byEmail: async(conn, email) => {
		return (await conn.query('SELECT * FROM accounts WHERE email = ?;', [email]))[0];
	},

	byId: async(conn, accountId) => {
		return (await conn.query('SELECT * FROM accounts WHERE account_id = ?;', [accountId]))[0];
	}
}

export const create = async(conn, accountId, fullName, email, password) => {
	await conn.query(
		`INSERT INTO accounts(account_id, full_name, email, password, role) VALUES(?, ?, ?, ?, ?);`,
		[ accountId, fullName, email, password, 'PARTICIPANT' ]
	);
}

export const update = async ({ conn, accountId, fullName, email, password }) => {
    if (!accountId) throw new Error('Missing account ID');

    const updates = [];
    const args = [];

    if (fullName) {
        updates.push('full_name = ?');
        args.push(fullName);
    }

    if (email) {
        updates.push('email = ?');
        args.push(email);
    }

    if (password) {
        updates.push('password = ?');
        args.push(password);
    }

    if (updates.length === 0) {
        throw new Error('Missng field(s) to update');
    }

    const query = `UPDATE accounts SET ${updates.join(', ')} WHERE account_id = ?`;
    args.push(accountId);

    await conn.query(query, args);
};

