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

  email: (input) => {
    return emailRegex.test(input);
  },

  password: (input) => {
    return input.length > 7 || input.length < 97;
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
  }
}

export const error = async(c, errorCode, errorMessage) => {
  return c.json({ message: errorMessage }, errorCode);
}
