const initState = {
    sensors: [
        { id: 0, state: "On", name: "Ph", ref: "", link: "", calibrationStep: 2, calibrationState: "Never" },
        { id: 1, state: "On", name: "temperature", ref: "DS18B20", link: "", calibrationStep: 0, calibrationState: "Never" },
        { id: 2, state: "On", name: "do", ref: "", link: "", calibrationStep: 0, calibrationState: "Never" },
        { id: 3, state: "On", name: "ec", ref: "", link: "", calibrationStep: 3, calibrationState: "Never" },
        { id: 4, state: "On", name: "tds", ref: "", link: "", calibrationStep: 0, calibrationState: "Never" },
        { id: 5, state: "On", name: "orp", ref: "", link: "", calibrationStep: 0, calibrationState: "Never" },
        { id: 6, state: "On", name: "turbidity", ref: "", link: "", calibrationStep: 0, calibrationState: "Never" },
    ],

    position: {
        lon: "",
        lat: "",
        speed: "",
        cap: ""
    },

    log: {
        isToggleOn: false,
        state: "Pause", // or Recording
        interval: "10sec" // or 30sec, 1min, 5min, 1hour, 1day 
    }
}

const rootReducer = (state = initState, action) => {
    console.log("Reducer - Action receieved : ", action.type);
    if (action.type === "CALIBRATE_SENSOR") {
        let sensor = state.sensors.find(sensor => sensor.id === action.id);
        console.log("Reducer - Calibrate sensor reducer function... ", sensor.name, "/", sensor.id);
        // Sending request to Teensy for calibration ok sensor.id 
        // return {};
    }
    else if (action.type === "LOG_RECORDING") {
        console.log("Reducer - Log recording on/off... ");
        state.log.isToggleOn = !state.log.isToggleOn;
        if (state.log.isToggleOn)
            state.log.state = "Recording";
        else
            state.log.state = "Pause";
        return state;
    }
    else {
        console.log("Unknown action.type received");
        return state;
    }
}

export default rootReducer;