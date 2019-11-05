import "./WindowsApp.css";

import Select from "react-select";
import React, { Component } from "react";
import { Connector } from "mqtt-react";

// Redux ( Using Sensors list & Log state )
import { connect } from "react-redux";
import { logRecord } from "../../actions/logRecord";

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
        this.state = { isToggleOn: true };
        this.handleAcquisitionButton = this.handleAcquisitionButton.bind(this);
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
        this.setState({ selectedOption }, () =>
            console.log("Option selected:", this.state.selectedOption)
        );
    };

    render() {
        const { sensors, log } = this.props;
        console.log(log);
        const sensorsList = sensors.length ? (
            sensors.map(sensor => {
                return (
                    <div className="sensor" key={sensor.id}>
                        <h3>{sensor.name} </h3>
                    </div>
                );
            })
        ) : (
            <p> Pas de capteurs identifiés </p>
        );

        const { selectedOption } = this.state;

        return (
            <div className="WAcquire">
                <h2>Acquisition - Harvest Data - Log status = {log.state} </h2>
                <h3 className="sensorList"> Sensors List : {sensorsList} </h3>
                {/* Launch recording process */}
                <Button
                    className="button"
                    onClick={this.handleAcquisitionButton}
                >
                    Load Acquisition {log.isToggleOn ? "ON" : "OFF"}
                </Button>
                <div>{log.state}</div>

                {/* Console login from MQTT */}
                <Connector mqttProps="ws://192.168.0.104:9001/">
                    <MqttConsole />
                </Connector>

                {/* Interval Selector */}
                <Select
                    value={selectedOption}
                    onChange={this.handleSelectChange}
                    options={options}
                />
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
    return {
        sensorsRecord: () => {
            dispatch(logRecord());
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WAcquire);
