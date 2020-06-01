import { createReducer } from 'reduxsauce';
import { REHYDRATE } from 'redux-persist';

import { socialActionTypes } from './social.actions';

/**
 * The initial values for the redux state.
 */
const INITIAL_STATE = {
	onlineUsers: [],
};

export const onlineUsers = (state, { users }) => ({
	...state,
	onlineUsers: users,
});

export const rehydrate = (state) => ({
	...state,
});

export const reducer = createReducer(INITIAL_STATE, {
	[socialActionTypes.ONLINE_USERS]: onlineUsers,
	[REHYDRATE]: rehydrate,
});

export default {
	social: reducer,
};
