import React from 'react';
import { push } from 'modules/history';

const Logo = () => (
	<div className="logo div-clickable" onClick={() => push('/')}>
		<h1 className="logo-title">WebRTC</h1>
		<h3 className="logo-subtitle mono">For us</h3>
	</div>
);
export default Logo;
