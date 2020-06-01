import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import NotFound from 'screens/NotFound';

import RoutePrivate from 'components/RoutePrivate';

import List from './UserList';
import VideoCall from './VideoCall';

class SocialIndex extends React.Component {
	static propTypes = {
		isAuthenticated: PropTypes.bool.isRequired,
	};

	render() {
		const { isAuthenticated } = this.props;
		const path = '/social';

		return (
			<Switch>
				<Route path={path} exact component={List} />
				<RoutePrivate
					isAuthenticated={isAuthenticated}
					path={`${path}/video-call`}
					component={VideoCall}
				/>
				<Route component={NotFound} />
			</Switch>
		);
	}
}

/* istanbul ignore next */
function mapStateToProps(state) {
	return {
		isAuthenticated: state.user.isAuthenticated,
	};
}

export default connect(mapStateToProps)(SocialIndex);
