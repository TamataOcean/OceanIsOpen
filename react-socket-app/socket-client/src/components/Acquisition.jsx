import React, { useState, useMemo, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Button,
  MenuItem,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Sensor from "./Sensors/Sensor";
import { ApiChangeLogsInterval, ApiToggleLogs } from "../features/sensorsAPI";
import io from "socket.io-client";
import { setSensors, dataSaved } from "../features/sensorsSlice";

const useStyles = makeStyles((theme) => {
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
});

const Acquisition = () => {
  // Material ui style classnames
  const classes = useStyles();
  // Simple state management for post and response from server
  const [post, setPost] = useState("");
  const [resToPost, setResToPost] = useState("");
  // The redux dispatch function
  const dispatch = useDispatch();
  // Redux selectors to access the state
  const sensors = useSelector((state) => state.sensors);
  const log = useSelector((state) => state.log);

  const dateUpdateData = useSelector((state) => state.lastDataSaved );

  const socket = useMemo(() => io(), []);

  // Handles socket io events
  useEffect(() => {
    socket.on("connect", () => console.log("connecté à socket.io"));
    socket.on("data", (data) => {
      const parsedData = JSON.parse(data);
      dispatch(setSensors(parsedData.state.reported.sensors));
    });
    
    socket.on("dataSaved", (data) => {
      const parsedData = JSON.parse(data);
      console.log("state.lastDataSaved = " + parsedData.gps.datetime );
      dispatch(dataSaved(parsedData.gps.datetime));
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, dispatch]);

  // Toggles the acquisition of data
  // and display response from server
  const handleToggleLogs = async (e) => {
    e.preventDefault();
    const serverResponse = await dispatch(ApiToggleLogs(post));
    setResToPost(serverResponse);
  };

  // Change acquisition interval
  const handleSelectChange = async (e) => {
    e.preventDefault();
    const newInterval = e.target.value;
    dispatch(ApiChangeLogsInterval(newInterval, post));
  };

  const sensorsList = sensors.length ? (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {sensors.map((sensor) => (
          <React.Fragment key={sensor.sensorId}>
            <Sensor sensor={sensor} />
          </React.Fragment>
        ))}
      </Grid>
    </div>
  ) : (
    <p>Pas de capteurs identifiés</p>
  );

  return (
    <div className={classes.container}>
      <h2>
        Acquisition - Harvest Data - Log status = {log.state} - Interval :{" "}
        {log.interval}
      </h2>

      <Accordion className={classes.expansion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <h3>Sensors list</h3>
        </AccordionSummary>
        <AccordionDetails>{sensorsList}</AccordionDetails>
      </Accordion>

      {/* Launch recording process */}
      {log.isToggleOn ? (
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          // onClick={this.handleAcquisitionButton}
          onClick={handleToggleLogs}
          className={classes.button}
          startIcon={<PauseIcon />}
        >
          Stop acquisition
        </Button>
      ) : (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleToggleLogs}
          className={classes.button}
          startIcon={<PlayArrowIcon />}
        >
          Start acquisition
        </Button>
      )}

      {/* Interval Selector */}
      <TextField
        select
        value={log.interval}
        onChange={handleSelectChange}
        label="Change log interval"
      >
        <MenuItem value="1000">Every second</MenuItem>
        <MenuItem value="5000">Every 5 seconds</MenuItem>
        <MenuItem value="10000">Every 10 seconds</MenuItem>
        <MenuItem value="60000">Every minute</MenuItem>
        <MenuItem value="3600000">Every hour</MenuItem>
      </TextField>

      <div>
        <p>
          <strong>Server console :</strong>
          <p></p>
        </p>
        <p>{resToPost}</p>
        <p>Last recording in postgres : {dateUpdateData}</p>
      </div>
    </div>
  );
};

export default Acquisition;
