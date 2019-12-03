import React, { Component } from "react";
import { Connector } from "mqtt-react";
import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Paper,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
// Redux ( Using Sensors list & Log state )
import { connect } from "react-redux";
import { logRecord, logInterval } from "../../actions/logRecord";
import Sensor from "../Sensors/sensor";
import MqttConsole from "../Mqtt/MqttConsole";

const styles = theme => {
  return {
    root: {
      flexGrow: 1,
      marginBottom: theme.spacing(2)
    },
    expansion: {
      width: "100%",
      marginBottom: theme.spacing(2)
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary
    },
    button: {
      marginBottom: theme.spacing(2)
    },
    container: {
      display: "flex",
      flexDirection: "column",
      left: "50%",
      padding: "10px"
    }
  };
};

class WAcquire extends Component {
  constructor(props) {
    super(props);
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
    const { sensors, log, classes } = this.props;
    // console.log("Render into WAcquire = ", log.interval);
    const sensorsList = sensors.length ? (
      <div className={classes.root}>
        <Grid container spacing={3}>
          {sensors.map(sensor => {
            return <Sensor simple id={sensor.id} key={sensor.id} />;
          })}
        </Grid>
      </div>
    ) : (
      <p> Pas de capteurs identifiés </p>
    );

    return (
      <div className={classes.container}>
        <h2>
          Acquisition - Harvest Data - Log status = {log.state} - Interval :{" "}
          {log.interval}
        </h2>

        <ExpansionPanel className={classes.expansion}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <h3>Sensors list</h3>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>{sensorsList}</ExpansionPanelDetails>
        </ExpansionPanel>

        {/* Launch recording process */}
        {log.isToggleOn && (
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAcquisitionButton}
            className={classes.button}
            startIcon={<PauseIcon />}
          >
            Load Acquisition ON
          </Button>
        )}
        {!log.isToggleOn && (
          <Button
            variant="contained"
            color="secondary"
            onClick={this.handleAcquisitionButton}
            className={classes.button}
            startIcon={<PlayArrowIcon />}
          >
            Load Acquisition OFF
          </Button>
        )}

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
