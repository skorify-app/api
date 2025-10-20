const requiredData = ['email', 'password', 'platform'];

export default async(c, db, util) => {
  let conn;

  try {
    const body = await c.req.json();

    if (!util.validate.body(requiredData, body)) {
      return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
    }

    let { email, password, platform } = body;
    email = email.toLowerCase();
    platform = platform.toLowerCase();

    if (!util.validate.email(email) || !util.validate.password(password)) {
      return await util.error(c, 400, 'Maaf, email atau password kamu salah.');
    }

    if (!util.validate.platform(platform)) {
      return await util.error(c, 400, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
    }

    conn = await db.getConn();

    const account = await db.account.get.byEmail(conn, email);
    if (!account) {
      return await util.error(c, 400, 'Maaf, email atau password kamu salah.');
    }

    if (!util.validate.allowOnPlatform(account.role, platform)) {
      c.status(400);
      return await util.error(c, 400, 'Maaf, tidak bisa masuk akun kamu di sini.');
    }

    console.log(account);

    return c.text('hi');
  } catch(err) {
    console.error(err);
    return await util.error(c, 500, 'Maaf, terdapat kesalahan saat mencoba masuk akun.');
  } finally {
    if (conn) conn.release();
  }
}
