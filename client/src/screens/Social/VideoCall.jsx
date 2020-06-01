import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { socialActions } from 'store/actions';
import PeerConnection from 'modules/webrtc/PeerConnection';

class VideoCall extends React.Component {
	constructor(props) {
		super(props);
		this.localStream = createRef(null);
		this.peerStream = createRef(null);
	}

	static propTypes = {
		history: PropTypes.object,
	};

	componentDidMount() {
		const { history } = this.props;
		const { to } = history.location.query;

		this.pc = new PeerConnection(to);
		this.pc
			.on('localStream', (stream) => {
				this.localStream.current.srcObject = stream;
			})
			.on('peerStream', (stream) => {
				this.peerStream.current.srcObject = stream;
			})
			.start();
	}

	render() {
		return (
			<div className="video-call flex column center spacing-1">
				<video ref={this.localStream} autoPlay muted />
				<video ref={this.peerStream} autoPlay muted />
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	user: state.user,
	onlineUsers: state.social.onlineUsers,
});

const mapDispatchToProps = (dispatch) => ({
	getUsers: (page) => dispatch(socialActions.loadUsers(page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoCall);
