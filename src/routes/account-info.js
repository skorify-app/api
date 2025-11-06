const requiredData = ['sessionId'];

export default async(c, db, util) => {
  let conn;

  try {
    const body = await c.req.json();

    if (!util.validate.body(requiredData, body)) {
      return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
    }

    const { sessionId } = body;

    if (!util.validate.sessionId(sessionId)) {
      return await util.error(c, 400, 'Maaf, ID sesi tidak valid.');
    }

    conn = await db.getConn();

    const accountId = await db.session.get(conn, sessionId);
    if (!accountId) {
      return await util.error(c, 400, 'Maaf, ID sesi tidak tercatat.');
    }

    const account = await db.account.get.byId(conn, accountId);
    if (!account) {
      return await util.error(c, 400, 'Maaf, akun tidak ditemukan atau sudah terhapus.');
    }

    delete account.password;

    return c.json({ success: true, account });
  } catch(err) {
    console.error(err.message);
    return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
  } finally {
    if (conn) conn.release();
  }
}
