import React, { Component } from "react";
import { Connector } from "mqtt-react";
import { withStyles } from "@material-ui/core/styles";
import { Button, Grid, Paper, Select, MenuItem } from "@material-ui/core";
// Redux ( Using Sensors list & Log state )
import { connect } from "react-redux";
import { logRecord, logInterval } from "../../actions/logRecord";

import MqttConsole from "../Mqtt/MqttConsole";

const styles = theme => {
  return {
    root: {
      flexGrow: 1
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary
    }
  };
};

class WAcquire extends Component {
  constructor(props) {
    super(props);
    //this.state = { isToggleOn: true };
    //this.handleAcquisitionButton = this.handleAcquisitionButton.bind(this);
    this.state = {
      selectedOption: null
    };
  }

  handleAcquisitionButton = () => {
    console.log("Acquisition Click...");
    // Laucnh Redux Action
    this.props.sensorsRecord();
  };

  handleSelectChange = selectedOption => {
    this.props.selectChange(selectedOption.target);
  };

  render() {
    const { sensors, log } = this.props;
    // console.log("Render into WAcquire = ", log.interval);
    const sensorsList = sensors.length ? (
      sensors.map(sensor => {
        return (
          <div className="sensor" key={sensor.id}>
            <h4>{sensor.name} </h4>
            <img src={sensor.logo} />
            {/* <img src={sensor.logo}  /> */}
          </div>
        );
      })
    ) : (
      <p> Pas de capteurs identifiés </p>
    );

    return (
      <div className="WAcquire">
        <h2>
          Acquisition - Harvest Data - Log status = {log.state} - Interval :{" "}
          {log.interval}
        </h2>
        <h3 className="sensorList"> Sensors List : {sensorsList} </h3>

        {/* Launch recording process */}
        <Button
          variant="contained"
          color={log.isToggleOn ? "primary" : "secondary"}
          onClick={this.handleAcquisitionButton}
        >
          Load Acquisition {log.isToggleOn ? "ON" : "OFF"}
        </Button>

        {/* Interval Selector */}
        <Select value={log.interval} onChange={this.handleSelectChange}>
          <MenuItem value="5sec">Every 5 seconds</MenuItem>
          <MenuItem value="10sec">Every 10 seconds</MenuItem>
          <MenuItem value="1min">Every minute</MenuItem>
          <MenuItem value="1hour">Every hour</MenuItem>
          <MenuItem value="1day">Every day</MenuItem>
        </Select>

        {/* Console login from MQTT */}
        <Connector mqttProps="ws://192.168.0.4:9001/">
          <MqttConsole topic="teensy/sensors" />
        </Connector>

        {/* Console login from MQTT */}
        <Connector mqttProps="ws://192.168.0.4:9001/">
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
  console.log("mapDispatchToProps");
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
)(withStyles(styles)(WAcquire));
