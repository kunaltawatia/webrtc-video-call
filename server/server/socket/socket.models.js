const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const { ProfileSchema } = require('../profile/profile.model');

/**
 * Socket Schema
 */
const SocketSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
	},
	profile: ProfileSchema,
});

/**
 * Statics
 */
SocketSchema.statics = {
	/**
	 * Get Socket
	 * @param {ObjectId} id - The objectId of Socket.
	 * @returns {Promise<Socket, APIError>}
	 */
	get(id) {
		return this.findOne({ id })
			.exec()
			.then((socket) => {
				if (socket) {
					return socket;
				}
				const err = new APIError(
					'No such Socket exists!',
					httpStatus.BAD_REQUEST,
					true,
				);
				return Promise.reject(err);
			});
	},
};

/**
 * @typedef Socket
 */
module.exports = mongoose.model('Socket', SocketSchema, 'sockets');
