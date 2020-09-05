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
  ExpansionPanelDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
// Redux ( Using Sensors list & Log state )
import { connect } from "react-redux";
import { logRecord, logInterval } from "../../actions/logRecord";
import Sensor from "../Sensors/sensor";
import MqttConsole from "../Console/MqttConsole";

const styles = (theme) => {
  return {
    root: {
      flexGrow: 1,
      marginBottom: theme.spacing(2),
    },
    expansion: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    button: {
      marginBottom: theme.spacing(2),
    },
    container: {
      display: "flex",
      flexDirection: "column",
      left: "50%",
      padding: "10px",
    },
  };
};

class WAcquire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
    };
  }
  componentDidMount() {
    this.callApi()
      .then((res) => this.setState({ response: res.express }))
      .catch((err) => console.log(err));
  }

  callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleAcquisitionButton = () => {
    console.log("Acquisition Click...");

    // Laucnh Redux Action
    this.props.sensorsRecord();
  };

  // Normal version... without connection to Teensy
  // handleSelectChange = selectedOption => {
  //   this.props.selectChange(selectedOption.target);
  // };

  // Try to send to Teensy...
  handleSelectChange = async (selectedOption) => {
    console.log("handleSelectChange... " + selectedOption);
    const response = await fetch(
      "/api/updateLogInterval?cmd_id=update_interval&interval=" +
        this.state.interval,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // récupération de la réponse du serveur http
        body: JSON.stringify({ post: this.state.post }),
        //interval: { interval : this.state.log.interval },
      }
    );
    const body = await response.text();
    this.props.selectChange(selectedOption.target);
  };

  // handleSubmit On / off a recode pour prise en compte du state...
  handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  handleSubmitOn = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/command?cmd_id=startLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // récupération de la réponse du serveur http
      body: JSON.stringify({ post: this.state.post }),
      //interval: { interval : this.state.log.interval },
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
    // Laucnh Redux Action
    this.props.sensorsRecord();
  };

  handleSubmitOff = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/command?cmd_id=stopLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // récupération de la réponse du serveur http
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
    // Laucnh Redux Action
    this.props.sensorsRecord();
  };

  render() {
    const { sensors, log, classes } = this.props;
    // console.log("Render into WAcquire = ", log.interval);
    const sensorsList = sensors.length ? (
      <div className={classes.root}>
        <Grid container spacing={3}>
          {sensors.map((sensor) => {
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
            type="submit"
            variant="contained"
            color="primary"
            // onClick={this.handleAcquisitionButton}
            onClick={this.handleSubmitOff}
            className={classes.button}
            startIcon={<PauseIcon />}
          >
            Load Acquisition ON
          </Button>
        )}
        {!log.isToggleOn && (
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            // onClick={this.handleAcquisitionButton}
            onClick={this.handleSubmitOn}
            className={classes.button}
            startIcon={<PlayArrowIcon />}
          >
            Load Acquisition OFF
          </Button>
        )}

        {/* Interval Selector */}
        <Select value={log.interval} onChange={this.handleSelectChange}>
          <MenuItem value="1000">Every second</MenuItem>
          <MenuItem value="5000">Every 5 seconds</MenuItem>
          <MenuItem value="10000">Every 10 seconds</MenuItem>
          <MenuItem value="60000">Every minute</MenuItem>
          <MenuItem value="3600000">Every hour</MenuItem>
        </Select>

        {/* Console login from MQTT */}
        {/* <Connector mqttProps="ws://192.168.0.4:9001/">
          <MqttConsole topic="teensy/sensors" />
        </Connector> */}

        {/* Console login from MQTT */}
        {/* <Connector mqttProps="ws://192.168.0.4:9001/">
          <MqttConsole topic="teensy/console" />
        </Connector> */}

        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={(e) => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sensors: state.sensors,
    log: state.log,
    interval: state.interval,
  };
};

const mapDispatchToProps = (dispatch) => {
  console.log("mapDispatchToProps");
  return {
    sensorsRecord: () => {
      dispatch(logRecord());
    },
    selectChange: (interval) => {
      dispatch({ type: "LOG_INTERVAL_CHANGE", interval: interval });
    },
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
