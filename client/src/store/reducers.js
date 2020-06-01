import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import user from './user/user.reducers';
import social from './social/social.reducers';
import app from './app/app.reducers';

const reducer = persistReducer(
	{
		key: 'mern-secret', // key is required
		storage, // storage is now required
		whitelist: ['user'],
	},
	combineReducers({ ...app, ...user, ...social }),
);

export default reducer;
