import React, { useEffect, useState } from "react";
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
import Sensor from "./Sensors/sensor";
import { toggleLogs } from "../features/sensorsSlice";

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
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [post, setPost] = useState("");
  const [resToPost, setResToPost] = useState("");

  const sensors = useSelector((state) => state.sensors);
  const log = useSelector((state) => state.log);
  const interval = useSelector((state) => state.interval);

  console.log({ sensors, log, interval });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post }),
    });

    const body = await response.text();
    setResToPost(body);
    // TODO: changer état redux
  };

  const handleStartLog = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/command?cmd_id=startLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // récupération de la réponse du serveur http
      body: JSON.stringify({ post }),
      //interval: { interval : this.state.log.interval },
    });
    const body = await response.text();

    setResToPost(body);
    dispatch(toggleLogs(body));
  };

  const handleStopLog = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/command?cmd_id=stopLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // récupération de la réponse du serveur http
      body: JSON.stringify({ post }),
    });
    const body = await response.text();

    setResToPost(body);
    dispatch(toggleLogs(body));
  };

  const handleSelectChange = async (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    async function helloServer() {
      const hello = await callApi();
      console.log({ hello });
    }

    helloServer();
  }, []);

  const callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  const sensorsList = sensors.length ? (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {sensors.map((sensor) => (
          <Sensor simple id={sensor.id} key={sensor.id} />
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
      {log.isToggleOn && (
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          // onClick={this.handleAcquisitionButton}
          onClick={handleStopLog}
          className={classes.button}
          startIcon={<PauseIcon />}
        >
          Stop acquisition
        </Button>
      )}
      {!log.isToggleOn && (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          // onClick={this.handleAcquisitionButton}
          onClick={handleStartLog}
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

      {/* Console login from MQTT */}
      {/* <Connector mqttProps="ws://192.168.0.4:9001/">
          <MqttConsole topic="teensy/sensors" />
        </Connector> */}

      {/* Console login from MQTT */}
      {/* <Connector mqttProps="ws://192.168.0.4:9001/">
          <MqttConsole topic="teensy/console" />
        </Connector> */}

      <form onSubmit={handleSubmit}>
        <TextField
          type="text"
          label="Post to Server"
          value={post}
          onChange={(e) => setPost(e.target.value)}
        />
        <Button type="submit">Submit</Button>
      </form>
      <p>{resToPost}</p>
    </div>
  );
};

export default Acquisition;
