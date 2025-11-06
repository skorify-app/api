import { hash, verify } from 'argon2';
import * as crypto from 'crypto';
import { ulid } from "ulid";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    return input.length > 7 && input.length < 97;
  },

  // Prevent staff to log in from android app
  allowOnMobile: (userRole) => {
    if (userRole === 'STAFF') return false;
    return true;
  },

  accountId: () => {
    return id.length === 26;
  },

  sessionId: (id) => {
    return id.length === 128;
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
