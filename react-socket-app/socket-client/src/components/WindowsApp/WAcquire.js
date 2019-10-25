import React, {Component, useState} from 'react';
import './WindowsApp.css';

import { Connector } from 'mqtt-react';
import MqttConsole from '../Mqtt/MqttConsole';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsonConfig from "./../System/config.json";

import ReactJson from 'react-json-view'
const listSensors = jsonConfig.sensors;

class WAcquire extends Component {
  constructor(props) {
    super(props);
    this.color = "red";
    this.state = {isToggleOn: true};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log("Click...")
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
    if(this.state.isToggleOn) {
      this.setState(state => ({
        color: "black"
      }));
    }
    else {
      document.body.style.backgroundColor = "white";
    }
  }

  render(){
      return (
        <div className="WAcquire">
          <h2>Acquisition - Harvest Data</h2>
          <h3> Sensors List : Ph - Temperature - Redox - ORP - Oxygen </h3>
          {/* <ReactJson src={ listSensors }/> */}
          <Button className="button" onClick={this.handleClick} variant="warning" color={this.state.color}>Load Acquisition {this.state.isToggleOn ? 'ON' : 'OFF'} </Button>
          <Connector mqttProps="ws://192.168.0.104:9001/"> 
            <MqttConsole /> 
          </Connector>
        </div>
        );
  }
}

export default WAcquire;
