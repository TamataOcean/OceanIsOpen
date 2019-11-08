import "./WindowsApp.css";

import Select from "react-select";
import React, { Component } from "react";
import { Connector } from "mqtt-react";

//Sensors logos
// import logoTemperature from "../../images/logoTemperature.png";

// Redux ( Using Sensors list & Log state )
import { connect } from "react-redux";
import { logRecord, logInterval } from "../../actions/logRecord";

import MqttConsole from "../Mqtt/MqttConsole";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const options = [
    { value: "5sec", label: "Every 5sec" },
    { value: "10sec", label: "Every 10sec" },
    { value: "1min", label: "Every minute" },
    { value: "1hour", label: "Every hour" },
    { value: "1day", label: "Every day" }
];

class WAcquire extends Component {
    constructor(props) {
        super(props);
        //this.state = { isToggleOn: true };
        //this.handleAcquisitionButton = this.handleAcquisitionButton.bind(this);
    }

    state = {
        selectedOption: null
    };

    handleAcquisitionButton = () => {
        console.log("Acquisition Click...");
        // Laucnh Redux Action
        this.props.sensorsRecord();
    };

    handleSelectChange = selectedOption => {
        console.log("Option selected:", selectedOption.value)
        this.props.selectChange( selectedOption )
        // this.setState({ selectedOption }, () =>
        // );
    };

    render() {
        const { sensors, log } = this.props;
        // console.log("Render into WAcquire = ", log.interval);
        const sensorsList = sensors.length ? (
            sensors.map(sensor => {
                return (
                    <div className="sensor" key={sensor.id}>
                        <h4>{sensor.name} </h4>
                        <img src={sensor.logo}  />
                        {/* <img src={sensor.logo}  /> */}
                    </div>
                );
            })
        ) : (
            <p> Pas de capteurs identifiés </p>
        );

        return (
            <div className="WAcquire">
                <h2>Acquisition - Harvest Data - Log status = {log.state} - Interval : {log.interval}</h2>
                <h3 className="sensorList"> Sensors List : {sensorsList} </h3>

                {/* Launch recording process */}
                <Button
                    className="button"
                    onClick={this.handleAcquisitionButton}
                >
                    Load Acquisition {log.isToggleOn ? "ON" : "OFF"}
                </Button>

                {/* Console login from MQTT */}
                <Connector mqttProps="ws://192.168.0.104:9001/">
                    <MqttConsole topic="teensy/sensors" />
                </Connector>

                {/* Interval Selector */}
                <Select
                    // value={selectedOption}
                    value={log.interval}
                    onChange={this.handleSelectChange}
                    options={options}
                />

                {/* Console login from MQTT */}
                <Connector mqttProps="ws://192.168.0.104:9001/">
                    <MqttConsole topic="teensy/console" />
                </Connector>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        sensors: state.sensors,
        log: state.log
    };
};

const mapDispatchToProps = dispatch => {
    console.log("mapDispatchToProps", )
    return {
        sensorsRecord: () => {
            dispatch(logRecord());
        }, 
        selectChange: interval => {
            dispatch({ type: "LOG_INTERVAL_CHANGE", interval: interval });
        }
    };
};

// const mapDispatchToProps = dispatch => {
//     return {
//       calibrateSensor : id => {
//         dispatch ({type: "CALIBRATE_SENSOR", id: id});
//       }
//     };
//   };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WAcquire);
