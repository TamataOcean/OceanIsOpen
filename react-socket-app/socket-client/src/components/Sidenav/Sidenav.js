import React from 'react';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';


const sidenav = props => (
	<SideNav
    	onSelect={(selected) => {
        	// Add your code here
    	}}
	>
    <SideNav.Toggle />
    <SideNav.Nav defaultSelected="home">
        <NavItem eventKey="home">
            <NavIcon>
                <i className="fa fa-fw fa-home" style={{ fontSize: '1.75em' }} />
            </NavIcon>
            <NavText>
                <a href="/">OceanIsOpen</a>
            </NavText>
        </NavItem>
        <NavItem eventKey="calibration">
            <NavIcon>
                <i className="fa fa-fw fa-line-chart" style={{ fontSize: '1.75em' }} />
            </NavIcon>
            <NavText>
                Calibration
            </NavText>
            <NavItem eventKey="calibration/ph">
                <NavText>
                    <a href="/calibrationPh"> Ph </a>
                </NavText>
            </NavItem>
            <NavItem eventKey="calibration/redox">
                <NavText>
                    Redox
                </NavText>
            </NavItem>   
        </NavItem>

        <NavItem eventKey="cartographie">
            <NavIcon>
                <i className="fa fa-fw fa-line-chart" style={{ fontSize: '1.75em' }} />
            </NavIcon>
            <NavText>
                Cartographie
            </NavText>
            <NavItem eventKey="calibration/ph">
                <NavText>
                    Lizmap
                </NavText>
            </NavItem>
            <NavItem eventKey="calibration/redox">
                <NavText>
                    Observation
                </NavText>
            </NavItem>   
        </NavItem>

        <NavItem eventKey="system">
            <NavIcon>
                <i className="fa fa-fw fa-line-chart" style={{ fontSize: '1.75em' }} />
            </NavIcon>
            <NavText>
                System
            </NavText>   
        </NavItem>
    </SideNav.Nav>
</SideNav>
);

export default sidenav;