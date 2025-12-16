import { hash, verify } from 'argon2';
import * as crypto from 'crypto';
import { ulid } from 'ulid';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const options = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	timeZone: 'Asia/Jakarta',
	timeZoneName: 'short'
};

export const validate = {
	body: (requiredData, sentData) => {
		let isValid = true;
		const dataKeys = Object.keys(sentData);

		if (requiredData.length !== dataKeys.length) return false;

		for (let key of dataKeys) {
			if (!requiredData.includes(key)) {
				isValid = false;
				break;
			}
		}

		return isValid;
	},

	fullName: (fullName) => {
		return fullName.length >= 3 && fullName.length <= 60;
	},

	email: (input) => {
		return emailRegex.test(input);
	},

	password: (input) => {
		if (input.length < 8 && input.length > 100) return false;
		return /[A-Z]/.test(input) &&
			/[a-z]/.test(input) &&
			/[0-9]/.test(input) &&
			/[!@#$%^&*(),.?":{}|<>]/.test(input);
	},

	// Prevent staff to log in from android app
	allowOnMobile: (userRole) => {
		return userRole === 'STAFF' ? false : true;
	},

	accountId: () => {
		return id.length === 26;
	},

	sessionId: (id) => {
		return id.length === 128;
	},

	account: async(db, conn, sessionId) => {
		const session = await db.session.get(conn, sessionId);
		if (!session) return { error: 'Maaf, ID sesi tidak tercatat.' };

		const account = await db.account.get.byId(conn, session.account_id);
		return account ?? { error: 'Maaf, akun tidak ditemukan atau sudah terhapus.' };
	}
}

export const error = async(c, errorCode, errorMessage) => {
	return c.json({ message: errorMessage }, errorCode);
}

export const password = {
	hash: async(str) => {
		return await hash(str);
	},
	verify: async(hash, str) => {
		return await verify(hash, str);
	}
}

export const generate = {
	accountId: () => {
		return ulid();
	},
	sessionId: () => {
		return crypto.randomBytes(64).toString('hex');
	}
}

export const convertTimestamp = (timestamp) => {
	const serverDate = new Date(timestamp);

	const localizedDate = new Date(serverDate - (1000 * 60 * 60));
	let result = localizedDate
	.toLocaleString('id-ID', options)
	.replace(' pukul', '')

	return result;
}
