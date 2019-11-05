import './WindowsApp.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Sensor from '../Sensors/sensor';

class WCalibration extends Component {

    render() {
        const { sensors } = this.props;
        const sensorsList = sensors.length ? (
            sensors.map(sensor => {
                return (
                    <Sensor id={sensor.id} />
                )
            })
        ) : (<p> Pas de capteurs identifiés </p>)

        return (
            <div>
                <h2>Manage - Calibration</h2>
                <h3> {sensorsList} </h3>
            </div>

        );
    }
}

const mapStateToProps = state => {
    return {
        sensors: state.sensors
    };
};

export default connect(
    mapStateToProps
    // mapDispatchToProps
)(WCalibration);