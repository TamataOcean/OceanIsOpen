import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Avatar } from "@material-ui/core";
import { logos } from "../../features/sensorsSlice";

const useStyles = makeStyles((theme) => {
  return {
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
    },
    image: {
      height: "100px",
    },
    simpleImage: {
      height: "80px",
    },
  };
});

const Sensor = ({ sensor }) => {
  const classes = useStyles();
  return (
    <Grid item xs={6} sm={3} lg={2} xl={2}>
      <Paper className={classes.paper}>
        <img
          src={logos[sensor.sensorName]}
          className={classes.simpleImage}
          alt={sensor.sensorName}
        />
        <p>{sensor.sensorName}</p>
      </Paper>
    </Grid>
  );
};

export default Sensor;
