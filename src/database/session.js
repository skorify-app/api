export const get = async(conn, sessionId) => {
  return (await conn.query('SELECT account_id FROM sessions WHERE session_id = ?', [sessionId]))[0];
}

export const insert = async(conn, sessionId, accountId) => {
  await conn.query('INSERT INTO sessions(session_id, account_id) VALUES(?, ?);', [sessionId, accountId]);
}

export const remove = async(conn, sessionId) => {
  await conn.query('DELETE FROM sessions WHERE session_id = ?;', [sessionId]);
}
