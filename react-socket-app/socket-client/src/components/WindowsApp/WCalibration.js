import "./WindowsApp.css";

import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Sensor from "../Sensors/sensor";

const styles = (theme) => {
  return {
    root: {
      flexGrow: 1,
    },
  };
};

class WCalibration extends Component {
  render() {
    const { sensors, classes } = this.props;
    const sensorsList = sensors.length ? (
      <div className={classes.root}>
        <Grid container spacing={3}>
          {sensors.map((sensor) => {
            return <Sensor id={sensor.id} />;
          })}
        </Grid>
      </div>
    ) : (
      <p> Pas de capteurs identifiés </p>
    );

    return <div>{sensorsList}</div>;
  }
}

const mapStateToProps = (state) => {
  return {
    sensors: state.sensors,
  };
};

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(withStyles(styles)(WCalibration));
