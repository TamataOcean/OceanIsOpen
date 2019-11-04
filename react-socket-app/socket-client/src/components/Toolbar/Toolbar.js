import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useRouteMatch
  } from "react-router-dom";

//App Windows 
import WAcquire from '../WindowsApp/WAcquire';  
import WCalibration from '../WindowsApp/WCalibration';  
import WGeopoppy from '../WindowsApp/WGeopoppy';  
import WGrafana from '../WindowsApp/WGrafana';  
import WSystem from '../WindowsApp/WSystem'
import WHome from '../WindowsApp/WHome'
import './Toolbar.css';
import DrawerToggleButton from '../SideDrawer/DrawerToggleButton';

const toolbar = props => (
	<header className="toolbar">

		<nav className="toolbar__nav">
			<div className='toggle-button'>
				<DrawerToggleButton />
			</div>
			<div className="toolbar__logo"> <a href="/"> OCEAN IS OPEN </a></div>			
			<div className="spacer" />
			<div className="toolbar__nav-items">
				<ul>
					<li><Link to={"/acquisistion"}> Acquisition</Link> </li>
					<li><Link to={"/calibration"}> Calibration</Link></li>
					<li><Link to={"/geopoppy"}> Geopoppy</Link> </li>
					<li><Link to={"/grafana"}> Grafana</Link> </li>
					<li><Link to={"/system"}> Systeme</Link> </li>
				</ul>
			</div>
		</nav>

		<Switch>
          <Route exact path="/" component={WHome} />
          <Route path="/acquisistion" component= {WAcquire} />
          <Route path="/calibration" component= {WCalibration} />
          <Route path="/geopoppy" component= {WGeopoppy} />
          <Route path="/system" component = {WSystem} />
          <Route path="/grafana" component = {WGrafana} />
        </Switch>
		
	</header>
);

export default toolbar;