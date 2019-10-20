import React from 'react';
import './SideDrawer.css';

const sideDrawer = props => (
		<nav className="side-drawer"> 
			<ul>
				<li><a href="/">Calibration</a> </li>
				<li><a href="/">Geopoppy</a> </li>
				<li><a href="/">Observation</a> </li>
				<li><a href="/">Systeme</a> </li>
			</ul>
		</nav>
	);

export default sideDrawer;