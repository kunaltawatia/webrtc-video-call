import React from 'react';
import { connect } from 'react-redux';
import { push } from 'modules/history';
import { Video } from 'react-feather';

export class Home extends React.PureComponent {
	render() {
		return (
			<div className="home flex column center spacing-2">
				<h1 className="logo-title">Video Call</h1>
				<button type="button" className="btn" onClick={() => push('/social')}>
					<div className="flex center">
						<Video />
					</div>
					Here
				</button>
			</div>
		);
	}
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(Home);
