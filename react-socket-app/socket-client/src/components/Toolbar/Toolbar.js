import React from 'react';
import './Toolbar.css';

const toolbar = props => (
	<header className="toolbar">
		<nav className="toolbar__nav">

			<div></div>
			<div className="toolbar__logo"> <a href="/"> OCEAN IS OPEN </a></div>	
			
			<div className="spacer"></div>
			
			<div className="toolbar__nav-items">
				<ul>
					<li><a href="/calibration"> Calibration </a> </li>
					<li><a href="/geopoppy"> Geopoppy </a> </li>
					<li><a href="/observation"> Observation </a> </li>
					<li><a href="/system"> Systeme </a> </li>
				</ul>
			</div>
		</nav>
	</header>
);

export default toolbar;