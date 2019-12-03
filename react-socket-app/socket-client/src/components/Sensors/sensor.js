import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Paper, Button } from "@material-ui/core";

const styles = theme => {
  return {
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary
    },
    image: {
      height: "100px"
    },
    simpleImage: {
      height: "80px"
    }
  };
};

class sensor extends Component {
  calibrate = () => {
    console.log("Calibration du capteur : ", this.props.sensor.name);
    this.props.calibrateSensor(this.props.sensor.id);
  };

  render() {
    const { sensor, classes, simple } = this.props;

    return simple ? (
      <Grid item xs={6} sm={3} lg={2} xl={2}>
        <Paper className={classes.paper}>
          <img src={sensor.logo} className={classes.simpleImage} />
          <p>{sensor.name}</p>
        </Paper>
      </Grid>
    ) : (
      <Grid item xs={6} sm={6} lg={4} xl={4}>
        <Paper className={classes.paper}>
          <img src={sensor.logo} className={classes.image} />
          <p>
            {sensor.name} - Calibration : {sensor.calibrationCurrentStep}/
            {sensor.calibrationStep}
          </p>
          <Button
            variant="contained"
            color="primary"
            onClick={this.calibrate}
            disabled={sensor.calibrationStep === sensor.calibrationCurrentStep}
          >
            Calibrer
          </Button>
        </Paper>
      </Grid>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let { id } = ownProps;
  return {
    sensor: state.sensors.find(sensor => sensor.id === id)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    calibrateSensor: id => {
      dispatch({ type: "CALIBRATE_SENSOR", id: id });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(sensor));
