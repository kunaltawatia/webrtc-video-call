/**
 * @module User/Sagas
 * @desc User
 */

import { all, takeLatest } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist/lib/constants';

/**
 * ToDo: App startup
 */
export function* startUp() {
	yield 1;
}

/**
 * User Sagas
 */
export default function* root() {
	yield all([takeLatest(REHYDRATE, startUp)]);
}
