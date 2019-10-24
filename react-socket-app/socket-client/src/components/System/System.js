import React, { Component } from 'react';
import ReactJson from 'react-json-view'
import jsonConfig from "./config.json"; 
import './System.css'
const configSystem = jsonConfig;

class System extends Component {
    state 
	render() {
		return (
            <ReactJson className="systemConsole"
                src={ configSystem } 
                theme="ocean"
                indentWidth="4"
                iconStyle="circle"
                edit
            />
        );
    }
} 
export default System;