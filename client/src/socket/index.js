import io from 'socket.io-client';
import { BACKEND } from 'constants/index';
import { socialActions, appActions } from 'store/actions';

// eslint-disable-next-line import/no-mutable-exports
let socket = io(BACKEND, {
	query: {
		token: null,
	},
});

const events = {
	error: (message, dispatch) => {
		dispatch(
			appActions.showAlert(
				message ?? 'Something went wrong while connecting to socket',
				{ variant: 'danger' },
			),
		);
	},
	online: (data, dispatch) => dispatch(socialActions.onlineUsers(data)),
};

export const seed = (dispatch) => {
	for (const event in events) {
		const element = events[event];
		socket.on(event, (data) => element(data, dispatch));
	}
};

export const setSocketToken = (token) => {
	socket.close();
	socket.io.opts.query = {
		token: `Bearer ${token}`,
	};
	socket.connect();
};

export default socket;
