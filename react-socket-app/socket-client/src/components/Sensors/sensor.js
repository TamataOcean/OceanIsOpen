import './sensor.css';

import React, {Component} from 'react';
import {connect } from 'react-redux';

class sensor extends Component {
    constructor(props) {
        super(props);
    }

  calibrate = () => {
    console.log("Calibration du capteur : ", this.props.sensor.name );
    this.props.calibrateSensor (this.props.sensor.id)
  };

  render(){
      const { sensor } = this.props;
      
      return (
          <div className="sensor">
            <img src={sensor.logo} />
            <p>{sensor.name} - Calibration steps : {sensor.calibrationStep} - Calibration state : {sensor.calibrationState} </p> 
            <button onClick={this.calibrate}> Calibrer </button>
          </div>
        );
  }
}

const mapStateToProps = (state, ownProps) =>  {
    let { id } = ownProps;
    return {
        sensor : state.sensors.find(sensor => sensor.id === id)
    };
};

const mapDispatchToProps = dispatch => {
  return {
    calibrateSensor : id => {
      dispatch ({type: "CALIBRATE_SENSOR", id: id});
    }
  };
};

export default connect(
  mapStateToProps, 
  mapDispatchToProps
)(sensor);