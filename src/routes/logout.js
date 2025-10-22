const requiredData = ['sessionId'];

export default async(c, db, util) => {
  let conn;

  try {
    const body = await c.req.json();

    if (!util.validate.body(requiredData, body)) {
      return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba keluar akun.');
    }

    const { sessionId } = body;
    conn = await db.getConn();

    console.log(sessionId.length)
    if (!util.validate.sessionId(sessionId)) {
      return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba keluar akun.');
    }

    await db.session.remove(conn, sessionId);
    return c.json({ success: true });
  } catch(err) {
    console.error(err);
    return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba keluar akun.');
  } finally {
    if (conn) conn.release();
  }
}