import socket from 'socket';

import MediaDevice from './MediaDevice';
import Emitter from './Emitter';

const PC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

class PeerConnection extends Emitter {
	/**
	 * Create a PeerConnection.
	 * @param {String} peerID - ID of the friend you want to call.
	 */
	constructor(peerId) {
		super();

		this.peerId = peerId;
		this.mediaDevice = new MediaDevice();
		this.pc = new RTCPeerConnection(PC_CONFIG);

		this.remoteIceCandidatesQueue = [];
		this.pc.onicecandidate = (event) =>
			socket.emit('ice-candidate', {
				candidate: event.candidate,
				to: peerId,
			});
		this.pc.ontrack = (event) => this.emit('peerStream', event.streams[0]);

		socket.on('ice-candidate', this.addIceCandidate.bind(this));
		socket.on('remote-description', this.setRemoteDescription.bind(this));
	}

	/**
	 * Starting the call
	 */
	start() {
		this.attachLocalStream(this.createOffer.bind(this));
	}

	/**
	 * Receiving the call
	 */
	recieve(call) {
		this.attachLocalStream(() =>
			this.setRemoteDescription(call, this.createAnswer.bind(this)),
		);
	}

	/**
	 * Attach and emit local stream
	 */
	attachLocalStream(next) {
		this.mediaDevice
			.on('stream', (stream) => {
				stream.getTracks().forEach((track) => {
					this.pc.addTrack(track, stream);
				});
				this.emit('localStream', stream);
				next?.();
			})
			.on('error', this.handleError.bind(this))
			.start();
	}

	async createOffer() {
		try {
			const localDescription = await this.pc.createOffer();
			await this.pc.setLocalDescription(localDescription);
			socket.emit('call', { description: localDescription, to: this.peerId });
		} catch (err) {
			this.handleError(err);
		}
	}

	async createAnswer() {
		try {
			const localDescription = await this.pc.createAnswer();
			await this.pc.setLocalDescription(localDescription);
			socket.emit('remote-description', {
				description: localDescription,
				to: this.peerId,
			});
		} catch (err) {
			this.handleError(err);
		}
	}

	/**
	 * @param {Object} description - Session description
	 */
	setRemoteDescription({ description, from }, next) {
		if (description && from === this.peerId) {
			const rtcSdp = new RTCSessionDescription(description);
			this.pc.setRemoteDescription(
				rtcSdp,
				() => {
					this.remoteIceCandidatesQueue.forEach((data) => {
						this.addIceCandidate(data);
					});
					next?.();
				},
				this.handleError.bind(this),
			);
		} else {
			this.handleError(
				new DOMException('Remote description is found to be empty'),
			);
		}
	}

	/**
	 * @param {Object} candidate - ICE Candidate
	 */
	addIceCandidate({ candidate, from }) {
		if (candidate && from === this.peerId) {
			if (this.pc.remoteDescription?.type) {
				const iceCandidate = new RTCIceCandidate(candidate);
				this.pc.addIceCandidate(iceCandidate);
			} else {
				this.remoteIceCandidatesQueue.push({ candidate, from });
			}
		}
	}

	handleError(err) {
		// eslint-disable-next-line no-console
		console.error(err);
		this.stop(true);
	}

	/**
	 * Stop the call
	 * @param {Boolean} initiator is the action taken by user or came in through signal
	 */
	stop(initiator) {
		if (initiator) {
			socket.emit('end-call', this.peerId);
		}

		this.mediaDevice.stop();

		this.pc.close();

		this.off();

		socket.off('ice-candidate', this.addIceCandidate);
		socket.off('remote-description', this.setRemoteDescription);
	}
}

export default PeerConnection;
