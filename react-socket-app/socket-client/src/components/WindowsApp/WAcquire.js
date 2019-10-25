import Select from 'react-select';
import React, {Component, useState} from 'react';
import './WindowsApp.css';

import { Connector } from 'mqtt-react';
import MqttConsole from '../Mqtt/MqttConsole';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsonConfig from "./../System/config.json";

import ReactJson from 'react-json-view'
const listSensors = jsonConfig.sensors;


const options = [
  { value: '5sec', label: 'Every 5sec' },
  { value: '10sec', label: 'Every 10sec' },
  { value: '1min', label: 'Every minute' },
  { value: '1hour', label: 'Every hour' },
  { value: '1day', label: 'Every day' },
];

class WAcquire extends Component {
  constructor(props) {
    super(props);
    this.color = "red";
    this.state = {isToggleOn: true};
    this.handleClick = this.handleClick.bind(this);
  }

  state = {
    selectedOption: null,
  };
  handleChange = selectedOption => {
    this.setState(
      { selectedOption },
      () => console.log(`Option selected:`, this.state.selectedOption)
    );
  };

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
      const { selectedOption } = this.state;
      return (
        <div className="WAcquire">
          <h2>Acquisition - Harvest Data</h2>
          <h3> Sensors List : Ph - Temperature - Redox - ORP - Oxygen </h3>
          {/* <ReactJson src={ listSensors }/> */}
          <Button className="button" onClick={this.handleClick} variant="warning" color={this.state.color}>Load Acquisition {this.state.isToggleOn ? 'ON' : 'OFF'} </Button>
          {/* <h3> Console Log</h3> */}
          <Connector mqttProps="ws://192.168.0.104:9001/"> 
            <MqttConsole /> 
          </Connector>
          <Select
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      />

        </div>
        );
  }
}

export default WAcquire;
