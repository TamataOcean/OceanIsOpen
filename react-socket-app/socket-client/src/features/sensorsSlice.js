import { createSlice } from "@reduxjs/toolkit";

import logoTemperature from "./../images/logoTemperature.png";
import logoPh from "./../images/logoPh.png";
// import logoDo from "./../images/logoDo.png";
// import logoEc from "./../images/logoEc.png";
// import logoTds from "./../images/logoTds.png";
// import logoOrp from "./../images/logoOrp.png";
import logoTurbidity from "./../images/logoTurbidity.png";

const initialState = {
  sensors: [
    {
      id: 0,
      state: "On",
      name: "Ph",
      logo: logoPh,
      ref: "",
      link: "",
      calibrationStep: 2,
      calibrationCurrentStep: 0,
      calibrationState: "Never",
    },
    {
      id: 1,
      state: "On",
      name: "temp",
      logo: logoTemperature,
      ref: "DS18B20",
      link: "",
      calibrationStep: 0,
      calibrationCurrentStep: 0,
      calibrationState: "Never",
    },
    // {
    //   id: 2,
    //   state: "On",
    //   name: "Do",
    //   logo: logoDo,
    //   ref: "",
    //   link: "",
    //   calibrationStep: 0,
    //   calibrationCurrentStep: 0,
    //   calibrationState: "Never"
    // },
    // {
    //   id: 3,
    //   state: "On",
    //   name: "Electrical Conductivity",
    //   logo: logoEc,
    //   ref: "",
    //   link: "",
    //   calibrationStep: 3,
    //   calibrationCurrentStep: 0,
    //   calibrationState: "Never"
    // },
    // {
    //   id: 4,
    //   state: "Off",
    //   name: "TDS",
    //   logo: logoTds,
    //   ref: "",
    //   link: "",
    //   calibrationStep: 0,
    //   calibrationCurrentStep: 0,
    //   calibrationState: "Never"
    // },
    // {
    //   id: 5,
    //   state: "Off",
    //   name: "ORP",
    //   logo: logoOrp,
    //   ref: "",
    //   link: "",
    //   calibrationStep: 0,
    //   calibrationCurrentStep: 0,
    //   calibrationState: "Never"
    // },
    {
      id: 6,
      state: "On",
      name: "Turbidity",
      logo: logoTurbidity,
      ref: "",
      link: "",
      calibrationStep: 0,
      calibrationCurrentStep: 0,
      calibrationState: "Never",
    },
  ],

  position: {
    lon: "",
    lat: "",
    speed: "",
    cap: "",
  },

  log: {
    isToggleOn: false,
    state: "Pause", // or Recording
    interval: "10sec", // or 30sec, 1min, 5min, 1hour, 1day
  },
};

const sensorsSlice = createSlice({
  name: "sensors",
  initialState,
  reducers: {
    calibrateSensor(state, action) {},
    toggleLogs(state, action) {
      console.log({ state, action });
      state.log.isToggleOn = !state.log.isToggleOn;
      state.log.state = state.log.isToggleOn ? "Recording" : "Pause";
    },
    logIntervalChange(state, action) {},
  },
});

export const {
  calibrateSensor,
  toggleLogs,
  logIntervalChange,
} = sensorsSlice.actions;

export default sensorsSlice.reducer;
