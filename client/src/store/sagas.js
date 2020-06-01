import { all, fork } from 'redux-saga/effects';

import app from './app/app.sagas';
import user from './user/user.sagas';
import social from './social/social.sagas';

/**
 * rootSaga
 */
export default function* root() {
	yield all([fork(app), fork(user), fork(social)]);
}
