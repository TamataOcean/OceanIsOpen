import React, { Component } from 'react';
import ReactJson from 'react-json-view'
import jsonConfig from "./config.json"; 
const configSystem = jsonConfig;

class System extends Component {
    state 
	render() {
		return (
            <ReactJson
                src={ configSystem } 
                theme="ocean"
                indentWidth="4"
                iconStyle="circle"
                style={{
                    width:"500px",
                    height:"50%",
                    padding: "10px",
                    left: "1%",
                    borderRadius: "10px",
                    margin: "10px 0px"
                }}
            />
        );
    }
} 
export default System;