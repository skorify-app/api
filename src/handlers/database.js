import mariadb from 'mariadb';
import * as fs from 'fs';

import * as accountHandler from '../database/account.js';
import * as sessionHandler from '../database/session.js';
import * as questionHandler from '../database/question.js';
import * as choiceHandler from '../database/choice.js';
import * as subtestHandler from '../database/subtest.js';
import * as recordedAnswerHandler from '../database/recorded-answer.js';
import * as scoreHandler from '../database/score.js';
import * as questionImagesHandler from '../database/question-images.js';

const sslPath = import.meta.dirname + '/../../ssl/';
let pool;

export const init = async function InitDatabase() {
	pool = mariadb.createPool({
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_DATABASE,
		connectionLimit: process.env.DB_CONN_LIMIT ?? 10,
		connectTimeout: 5000,
		ssl: {
			cert: fs.readFileSync(sslPath + 'client-cert.pem'),
			key: fs.readFileSync(sslPath + 'client-key.pem'),
			ca: fs.readFileSync(sslPath + 'ca-cert.pem'),
			rejectUnauthorized: false
		}
	});
	console.log('Database pool has been created.');


	// not required: to detect unreleased connections
	/*pool.on('acquire', (connection) => {
		console.log(`Connection ${connection.threadId} acquired from pool`);
	});

	pool.on('connection', (connection) => {
		console.log(`New connection ${connection.threadId} created in pool`);
	});

	pool.on('release', (connection) => {
		console.log(`Connection ${connection.threadId} released back to pool`);
	});

	setInterval(() => {
		const active = pool.activeConnections();
		const total = pool.totalConnections();
		const idle = pool.idleConnections();
		const queued = pool.taskQueueSize();

		console.log(`Pool status: ${active}/${total} connections active, ${idle} idle, ${queued} requests queued`);
	}, 1000);*/
}

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
export const subtest = subtestHandler;
export const recordedAnswer = recordedAnswerHandler;
export const score = scoreHandler;
export const questionImages = questionImagesHandler;
