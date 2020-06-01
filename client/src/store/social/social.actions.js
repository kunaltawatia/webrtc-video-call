import { createActions } from 'reduxsauce';

const { Types, Creators } = createActions(
	{
		/* redux-saga actions */

		/* redux state actions */
		onlineUsers: ['users'],
	},
	{
		prefix: 'SOCIAL_',
	},
);

export const socialActionTypes = Types;
export default Creators;
