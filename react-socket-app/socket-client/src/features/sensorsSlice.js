import { createSlice } from "@reduxjs/toolkit";

import logoTemperature from "./../images/logoTemperature.png";
import logoPh from "./../images/logoPh.png";
import logoDo from "./../images/logoDo.png";
import logoEc from "./../images/logoEc.png";
import logoTds from "./../images/logoTds.png";
import logoOrp from "./../images/logoOrp.png";
import logoTurbidity from "./../images/logoTurbidity.png";

export const logos = {
  Temperature: logoTemperature,
  GravityPH: logoPh,
  GravityDo: logoDo,
  GravityEC: logoEc,
  GravityTDS: logoTds,
  GravityORP: logoOrp,
  GravityTurbidity: logoTurbidity,
};

const initialState = {
  sensors: [],

  position: {
    lon: "",
    lat: "",
    speed: "",
    cap: "",
  },

  log: {
    isToggleOn: false,
    state: "Pause", // or Recording
    interval: "10000", // or 30sec, 1min, 5min, 1hour, 1day
  },

  server: {
    isConnected: false,
    isFetching: false,
  },

  gnss: {
    gps: {
      datetime: "2020-09-18 13:33:33.33",
      date: "2020-09-18",
      time: "13:33:33.33",
      validity: true,
    },
    geo: {
      latitude: 46.155253,
      longitude: -1.145492,
      bearing: null,
    },
    speed: {
      knots: 0.038,
      kmh: 0.07,
      mph: 0.044,
    },
  },
};

const sensorsSlice = createSlice({
  name: "sensors",
  initialState,
  reducers: {
    setSensors(state, action) {
      console.log({ action });
      console.log(Object.keys(action.payload).map((el) => action.payload[el]));
      state.sensors = Object.keys(action.payload).map(
        (el) => action.payload[el]
      );
    },
    calibrateSensor(state, action) {
      const { sensorId, isCalibrate } = action.payload;
      state.sensors.forEach((sensor) => {
        if (sensor.sensorId === sensorId) {
          if (sensor.isCalibrate !== isCalibrate) {
            sensor.isCalibrate = isCalibrate;
          }
          sensor.calibrationCurrentStep += 1;
        }
      });
    },
    initSensorCalibration(state, action) {
      const sensorId = action.payload;
      state.sensors.forEach((sensor) => {
        if (sensor.sensorId === sensorId) {
          sensor.calibrationCurrentStep = 0;
          sensor.message = "";
        }
      });
    },
    setSensorMessage(state, action) {
      const { sensorId, message } = action.payload;
      state.sensors.forEach((sensor) => {
        if (sensor.sensorId === sensorId) {
          sensor.message = message;
        }
      });
    },
    toggleLogs(state, action) {
      state.log.isToggleOn = !state.log.isToggleOn;
      state.log.state = state.log.isToggleOn ? "Recording" : "Pause";
    },
    changeLogsInterval(state, action) {
      state.log.interval = action.payload;
    },
    fetchingData(state) {
      state.server.isFetching = true;
    },
    fetchedData(state) {
      state.server.isFetching = false;
    },
    serverConnected(state) {
      state.server.isConnected = true;
    },
    serverDisconnected(state) {
      state.server.isConnected = false;
    },
    setGnssData(state, action) {
      state.gnss = action.payload;
    },
  },
});

export const {
  setSensors,
  calibrateSensor,
  initSensorCalibration,
  toggleLogs,
  changeLogsInterval,
  serverConnected,
  serverDisconnected,
  fetchedData,
  fetchingData,
  setSensorMessage,
  setGnssData,
} = sensorsSlice.actions;

export default sensorsSlice.reducer;
