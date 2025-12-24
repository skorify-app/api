export default async(c) => {
	const account = c.req.account;
	delete account.password;

	const role = account.role
	.replace('ADMIN', 'Admin')
	.replace('STAFF', 'Staf')
	.replace('PARTICIPANT', 'Peserta');
	account.role = role;

	return c.json({ account });
}
