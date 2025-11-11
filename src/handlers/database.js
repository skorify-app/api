import mariadb from 'mariadb';
import * as accountHandler from '../database/account.js';
import * as sessionHandler from '../database/session.js';
import * as questionHandler from '../database/question.js';
import * as choiceHandler from '../database/choice.js';

let pool;

export const init = async function InitDatabase() {
	pool = mariadb.createPool({
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_DATABASE,
		connectionLimit: process.env.DB_CONN_LIMIT ?? 10,
		connectTimeout: 5000
	});
	console.log('Database pool has been created.');

	// Create tables if those don't exist
	const conn = await pool.getConnection();
	await conn.query(`CREATE TABLE IF NOT EXISTS accounts(
		account_id CHAR(26) NOT NULL PRIMARY KEY,
		full_name varchar(60) NOT NULL,
		email varchar(60) NOT NULL UNIQUE,
		password varchar(128) NOT NULL,
		role ENUM('ADMIN', 'STAFF', 'PARTICIPANT') NOT NULL
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS sessions(
		session_id CHAR(128) NOT NULL PRIMARY KEY,
		account_id CHAR(26) NOT NULL,
		FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS subtests(
		subtest_id SMALLINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		subtest_name VARCHAR(32) NOT NULL
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS questions(
		question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		subtest_id SMALLINT NOT NULL,
		question_text VARCHAR(256) NOT NULL,
		answer CHAR(1) NOT NULL,
		FOREIGN KEY (subtest_id) REFERENCES subtests(subtest_id) ON DELETE CASCADE
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS choices(
		question_id INT NOT NULL,
		label CHAR(1) NOT NULL,
		choice_value VARCHAR(100) NOT NULL,
		FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS scores(
		score_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		subtest_id SMALLINT NOT NULL,
		account_id CHAR(26) NOT NULL,
		score SMALLINT NOT NULL,
		recorded_at TIMESTAMP NOT NULL,
		FOREIGN KEY (subtest_id) REFERENCES subtests(subtest_id) ON DELETE CASCADE,
		FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS recorded_answers(
		score_id INT NOT NULL,
		question_id INT NOT NULL,
		answer CHAR(1) NOT NULL,
		FOREIGN KEY (score_id) REFERENCES scores(score_id) ON DELETE CASCADE,
		FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
	);`);

	await conn.query(`CREATE TABLE IF NOT EXISTS question_logs(
		question_id INT NOT NULL,
		old_text INT,
		old_answer INT,
		FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
	);`);
	conn.release();
}

// not required: to detect unreleased connections
/*pool.on('acquire', (connection) => {
	console.log(`Connection ${connection.threadId} acquired from pool`);
});

pool.on('connection', (connection) => {
	console.log(`New connection ${connection.threadId} created in pool`);
});

pool.on('release', (connection) => {
	console.log(`Connection ${connection.threadId} released back to pool`);
});*/

export const getPool = function GetDatabasePool() {
	return pool;
}

export const getConn = function GetConnection() {
	return pool.getConnection();
}

export const account = accountHandler;
export const session = sessionHandler;
export const question = questionHandler;
export const choice = choiceHandler;
