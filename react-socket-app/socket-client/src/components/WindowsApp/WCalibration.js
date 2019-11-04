import './WindowsApp.css';

import React, {Component} from 'react';
import {connect } from 'react-redux';
import Sensor from '../Sensors/sensor';

class WCalibration extends Component {
  calibrate = () => {
    console.log("Calibration du capteur : ", this.props.sensor.name );
    this.props.calibrateSensor (this.props.sensor.id)
  };

  render(){
      const { sensors } = this.props;
      const sensorsList = sensors.length ? ( 
        sensors.map( sensor => {
          return(
            <Sensor id={ sensor.id } />
          )
        })
      ) : ( <p> Pas de capteurs identifiés </p>)

      return (
          <div>
            <h2>Manage - Calibration</h2>
            <h3> {sensorsList} </h3>
          </div>

        );
  }
}

const mapStateToProps = state =>  {
  return {
    sensors : state.sensors
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
)(WCalibration);