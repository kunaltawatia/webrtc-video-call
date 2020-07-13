import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
	/**
	 * Start media devices and send stream
	 */
	start(config) {
		const constraints = {
			video: {
				facingMode: 'user',
				height: { min: 360, ideal: 720, max: 1080 },
			},
			audio: true,
		};

		navigator.mediaDevices
			.getUserMedia(config ?? constraints)
			.then((stream) => {
				this.stream = stream;
				this.emit('stream', stream);
			})
			.catch((err) => {
				this.emit('error', err);
			});
	}

	/**
	 * Turn on/off a device
	 * @param {String} type - Type of the device
	 * @param {Boolean} [on] - State of the device
	 */
	toggle(type, on) {
		const len = arguments.length;
		if (this.stream) {
			this.stream[`get${type}Tracks`]().forEach((track) => {
				track.enabled = len === 2 ? on : !track.enabled;
			});
		}
		return this;
	}

	/**
	 * Stop all media track of devices
	 */
	stop() {
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
		}
		return this;
	}
}

export default MediaDevice;
