const initState = {
    sensors: [
        {
            id: 0,
            state: "On",
            name: "Ph",
            ref: "",
            link: "",
            calibrationStep: 2,
            calibrationState: "Never"
        },
        {
            id: 1,
            state: "On",
            name: "temperature",
            ref: "DS18B20",
            link: "",
            calibrationStep: 0,
            calibrationState: "Never"
        },
        {
            id: 2,
            state: "On",
            name: "do",
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationState: "Never"
        },
        {
            id: 3,
            state: "On",
            name: "ec",
            ref: "",
            link: "",
            calibrationStep: 3,
            calibrationState: "Never"
        },
        {
            id: 4,
            state: "On",
            name: "tds",
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationState: "Never"
        },
        {
            id: 5,
            state: "On",
            name: "orp",
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationState: "Never"
        },
        {
            id: 6,
            state: "On",
            name: "turbidity",
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationState: "Never"
        }
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
};

const rootReducer = (state = initState, action) => {
    console.log("Reducer - Action receieved : ", action.type);
    switch (action.type) {
        case "CALIBRATE_SENSOR":
            let sensor = state.sensors.find(sensor => sensor.id === action.id);
            console.log(
                "Reducer - Calibrate sensor reducer function... ",
                sensor.name,
                "/",
                sensor.id
            );
            // Sending request to Teensy for calibration ok sensor.id
            // return {};
            break;
        case "LOG_RECORDING":
            console.log("Reducer - Log recording on/off... ");
            state.log.isToggleOn = !state.log.isToggleOn;
            // tu connais peut être, mais si tu veux utiliser un debugger facilement dans le navigateur, tu peux utiliser la commande ci-dessous
            // debugger;
            const recordingState = state.log.isToggleOn ? "Recording" : "Pause";
            console.log({
                ...state,
                log: { ...state.log, state: recordingState }
            });
            /* l'expression en dessous correspond à
            { ...tout le reste de state, log: { ...tout le reste de state.log, state: la valeur voulue }}
               elle applique le concept d'immutabilité, qu'il faut utiliser avec Redux afin que le composant cible
               capte le changement de données : <https://redux.js.org/faq/immutable-data>
            */
            return { ...state, log: { ...state.log, state: recordingState } };
        default:
            console.log("Unknown action.type received");
            return state;
    }
};

export default rootReducer;
