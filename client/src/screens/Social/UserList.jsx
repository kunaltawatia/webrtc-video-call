import React, { createRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Video, X, Check } from 'react-feather';
import Modal from 'react-modal';

import Image from 'components/Image';
import PeerConnection from 'modules/webrtc/PeerConnection';
import socket, { setSocketToken, seed } from 'socket/index';

class UserList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			videoCallModalOpen: false,
			callingWith: null,
			callPickedUp: false,
			remoteDescription: null,
		};
		this.localStream = createRef(null);
		this.peerStream = createRef(null);
	}

	static propTypes = {
		dispatch: PropTypes.func,
		onlineUsers: PropTypes.array,
		user: PropTypes.object,
	};

	componentDidMount() {
		const { dispatch, user } = this.props;

		setSocketToken(user.token);
		seed(dispatch);

		socket
			.on('call', (call) => {
				this.setState({
					videoCallModalOpen: true,
					callPickedUp: false,
					callingWith: call.from,
					remoteDescription: call.description,
				});
			})
			.on('end-call', () => {
				this.pc.stop();
				this.setState({ videoCallModalOpen: false, callPickedUp: false });
			});
	}

	componentWillUnmount() {
		this.pc?.stop();
		socket.close();
	}

	call = (id) => {
		this.setState(
			{ videoCallModalOpen: true, callingWith: id, callPickedUp: true },
			() => {
				this.pc = new PeerConnection(id);
				this.pc
					.on('localStream', (stream) => {
						this.localStream.current.srcObject = stream;
					})
					.on('peerStream', (stream) => {
						this.peerStream.current.srcObject = stream;
					})
					.start();
			},
		);
	};

	recieve = () => {
		this.setState({ callPickedUp: true }, () => {
			const { callingWith: id, remoteDescription } = this.state;
			this.pc = new PeerConnection(id);
			this.pc
				.on('localStream', (stream) => {
					this.localStream.current.srcObject = stream;
				})
				.on('peerStream', (stream) => {
					this.peerStream.current.srcObject = stream;
				})
				.recieve({ description: remoteDescription, from: id });
		});
	};

	endCall = () => {
		const { callingWith } = this.state;

		this.pc?.stop();
		this.setState({ videoCallModalOpen: false });
		socket.emit('end-call', { to: callingWith });
	};

	render() {
		const { onlineUsers, user } = this.props;
		const { videoCallModalOpen, callPickedUp } = this.state;

		const onlineUsersExceptOwner = onlineUsers.filter(
			(onlineUser) => onlineUser.profile?.email !== user.info?.email,
		);

		return (
			<div className="user-list flex column center spacing-1">
				<h3 className="mono">Online Users</h3>
				{!onlineUsersExceptOwner.length ? (
					<p className="font-light">No Users Online</p>
				) : (
					onlineUsersExceptOwner.map((onlineUser) => {
						const { name, email, picture } = onlineUser.profile || {};
						return (
							<div
								key={onlineUser._id}
								className="profile-box flex row center spacing"
							>
								<Image src={picture} circle clickable size="40px" />
								<div className="flex column">
									<p className="profile-box-name bold">{name}</p>
									<a
										className="profile-box-email font-light"
										href={`mailto:${email}`}
									>
										{email}
									</a>
								</div>
								<div
									onClick={() => this.call(onlineUser.id)}
									className="icon-box flex row center spacing div-clickable"
								>
									<Video />
								</div>
							</div>
						);
					})
				)}
				<Modal
					isOpen={videoCallModalOpen}
					// onRequestClose={this.endCall}
					className="video-call-modal flex column center spacing-2"
					overlayClassName="prompt-modal-overlay"
					ariaHideApp={false}
				>
					{callPickedUp ? (
						<>
							<video ref={this.peerStream} autoPlay muted />
							<video ref={this.localStream} autoPlay muted />
							<button className="btn" type="button" onClick={this.endCall}>
								<div className="flex center">
									<X />
								</div>
								End
							</button>
						</>
					) : (
						<>
							<button className="btn" type="button" onClick={this.recieve}>
								<div className="flex center">
									<Check />
								</div>
								Pick
							</button>
							<button className="btn" type="button" onClick={this.endCall}>
								<div className="flex center">
									<X />
								</div>
								Nope
							</button>
						</>
					)}
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.user,
	onlineUsers: state.social.onlineUsers,
});

export default connect(mapStateToProps)(UserList);
