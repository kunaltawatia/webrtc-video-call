const io = require('socket.io')();
const authentication = require('../middlewares/authentication');
const Socket = require('./socket.models');

let sockets = [];

io.use((socket, next) => {
	socket.headers = {
		authorization: socket.handshake.query.token,
	};
	authentication(socket, null, (err) => {
		if (err) return next(err);

		const { id, user } = socket;

		Socket.findOne(
			{
				'profile.email': user.email,
			},
			(err, entry) => {
				let databaseEntry =
					entry ||
					new Socket({
						id,
						profile: user,
					});

				databaseEntry.id = id;
				databaseEntry.profile = user;

				databaseEntry
					.save()
					.then((user) => {
						socket.user = user;
						next();
					})
					.catch((err) => next(err));
			},
		);
	});
});

const broadcastUsers = () => {
	Socket.find()
		.then((users) => {
			io.emit('online', users);
		})
		.catch((err) => console.error(err));
};

io.on('connection', (socket) => {
	broadcastUsers();

	['call', 'ice-candidate', 'remote-description', 'end-call'].forEach(
		(event) => {
			socket.on(event, (data) => {
				io.to(data.to).emit(event, { ...data, from: socket.id });
			});
		},
	);

	socket.on('disconnect', () => {
		Socket.findOneAndDelete({ id: socket.id }, (err) => {
			if (err) console.error(err);
		});
		broadcastUsers();
	});
});

module.exports = io;
