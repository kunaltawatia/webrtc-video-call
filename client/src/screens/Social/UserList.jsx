import React, { createRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Video, X } from 'react-feather';
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
				this.pc = new PeerConnection(call.from);
				this.setState(
					{ videoCallModalOpen: true, callingWith: call.from },
					() => {
						this.pc
							.on('localStream', (stream) => {
								this.localStream.current.srcObject = stream;
							})
							.on('peerStream', (stream) => {
								this.peerStream.current.srcObject = stream;
							})
							.recieve(call);
					},
				);
			})
			.on('end-call', () => {
				this.pc.stop();
				this.setState({ videoCallModalOpen: false });
			});
	}

	componentWillUnmount() {
		socket.close();
	}

	call = (id) => {
		this.pc = new PeerConnection(id);
		this.setState({ videoCallModalOpen: true, callingWith: id }, () => {
			this.pc
				.on('localStream', (stream) => {
					this.localStream.current.srcObject = stream;
				})
				.on('peerStream', (stream) => {
					this.peerStream.current.srcObject = stream;
				})
				.start();
		});
	};

	endCall = () => {
		const { callingWith } = this.state;

		this.pc.stop();
		this.setState({ videoCallModalOpen: false });
		socket.emit('end-call', { to: callingWith });
	};

	render() {
		const { onlineUsers, user } = this.props;
		const { videoCallModalOpen } = this.state;

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
					<video ref={this.peerStream} autoPlay muted />
					<video ref={this.localStream} autoPlay muted />
					<button className="btn" type="button" onClick={this.endCall}>
						<div className="flex center">
							<X />
						</div>
						End
					</button>
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
