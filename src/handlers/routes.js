import info from '../routes/account/info.js';
import login from '../routes/account/login.js';
import logout from '../routes/account/logout.js';
import register from '../routes/account/register.js';
import update from '../routes/account/update.js';

import get from '../routes/questions/get.js';
import submit from '../routes/questions/submit.js';

const account = {
	info, login, logout, register, update
}

const questions = {
	get, submit
}

export {
	account, questions
}