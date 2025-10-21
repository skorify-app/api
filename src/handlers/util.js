import { hash, verify } from 'argon2';
import * as crypto from 'crypto';
import { ulid } from "ulid";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const platforms = ['android', 'web'];

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

  platform: (input) => {
    return platforms.includes(input);
  },

  // If the user allows to log in on certain platform, like
  // staff on web and participant on android.
  allowOnPlatform: (userRole, platform) => {
    if (userRole === 'PARTICIPANT' && platform !== 'android') return false;
    if (userRole === 'STAFF' && platform !== 'web') return false;
    return true;
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
