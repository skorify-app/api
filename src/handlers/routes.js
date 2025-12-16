import info     from '../routes/account/info.js';
import login    from '../routes/account/login.js';
import logout   from '../routes/account/logout.js';
import register from '../routes/account/register.js';
import update   from '../routes/account/update.js';

import get      from '../routes/questions/get.js';
import submit   from '../routes/questions/submit.js';

import index    from '../routes/subtests/index.js';

import validate from '../routes/session/validate.js';

import fetch    from '../routes/scores/fetch.js';
import detail   from '../routes/scores/detail.js';


const account = {
	info, login, logout, register, update
}

const questions = {
	get, submit
}

const subtests = {
	index
}

const session = {
	validate
}

const scores = {
	fetch, detail
}

export {
	account, questions, subtests, session, scores
}
