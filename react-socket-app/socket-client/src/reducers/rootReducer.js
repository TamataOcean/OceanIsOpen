import logoTemperature from "./../images/logoTemperature.png";
import logoPh from "./../images/logoPh.png";
import logoDo from "./../images/logoDo.png";
import logoEc from "./../images/logoEc.png";
import logoTds from "./../images/logoTds.png";
import logoOrp from "./../images/logoOrp.png";
import logoTurbidity from "./../images/logoTurbidity.png";

const initState = {
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
            calibrationState: "Never"
        },
        {
            id: 1,
            state: "On",
            name: "temperature",
            logo: logoTemperature,
            ref: "DS18B20",
            link: "",
            calibrationStep: 0,
            calibrationCurrentStep: 0,
            calibrationState: "Never"
        },
        {
            id: 2,
            state: "On",
            name: "Do",
            logo: logoDo,
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationCurrentStep: 0,
            calibrationState: "Never"
        },
        {
            id: 3,
            state: "On",
            name: "EC",
            logo: logoEc,
            ref: "",
            link: "",
            calibrationStep: 3,
            calibrationCurrentStep: 0,
            calibrationState: "Never"
        },
        {
            id: 4,
            state: "On",
            name: "TDS",
            logo: logoTds,
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationCurrentStep: 0,
            calibrationState: "Never"
        },
        {
            id: 5,
            state: "On",
            name: "ORP",
            logo: logoOrp,
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationCurrentStep: 0,
            calibrationState: "Never"
        },
        {
            id: 6,
            state: "On",
            name: "turbidity",
            logo: logoTurbidity,
            ref: "",
            link: "",
            calibrationStep: 0,
            calibrationCurrentStep: 0,
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
        interval: "11sec" // or 30sec, 1min, 5min, 1hour, 1day
    }
};

const rootReducer = (state = initState, action) => {
    console.log("Reducer - Action receieved : ", action.type);
    switch (action.type) {
        case "CALIBRATE_SENSOR":

            let sensor = state.sensors.find(sensor => sensor.id === action.id);
            let calibrationCurrentStep = sensor.calibrationCurrentStep;
            
            console.log(
                "Reducer - Calibrate sensor reducer function... ",
                sensor.name,
                "/",
                sensor.id, 
                "/", sensor.calibrationCurrentStep
            );
            // Sending request to Teensy for calibration ok sensor.id
            // return {};
            
            return {
                ...state,
                sensors: state.sensors.map(sensor => sensor.id === action.id ?
                    //transform the one with a matching id
                    { ...sensor, calibrationCurrentStep: calibrationCurrentStep+1 } : 
                    //otherwise return original todo
                    sensor
                ) 
            };

            break;
        case "LOG_RECORDING":
            //debugger;
            console.log("Reducer - Log recording on/off... ");
            state.log.isToggleOn = !state.log.isToggleOn;
            
            // tu connais peut être, mais si tu veux utiliser un debugger facilement dans le navigateur, tu peux utiliser la commande ci-dessous
            //debugger;
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

        /* Maj de l'interval de log
        --------------------------- */
        case "LOG_INTERVAL_CHANGE":
            // debugger;
            // console.log(action);
            const recordingInterval = action.interval.value;
            console.log("Reducer - Log Interval change", recordingInterval );
            return { ...state, log: { ...state.log, interval: recordingInterval } };
        
        
        default:
            console.log("Unknown action.type received");
            return state;
    }
};

export default rootReducer;
