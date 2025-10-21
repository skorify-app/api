export const get = {
  byEmail: async(conn, email) => {
    return (await conn.query('SELECT * FROM accounts WHERE email = ?', [email]))[0];
  }
}

export const create = async(conn, accountId, fullName, email, password) => {
  await conn.query(
    `INSERT INTO accounts(account_id, full_name, email, password, role) VALUES(?, ?, ?, ?, ?);`,
    [
      accountId,
      fullName,
      email,
      password,
      'PARTICIPANT'
    ]
  );
}
