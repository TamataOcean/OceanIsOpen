import {
  changeLogsInterval,
  setSensors,
  toggleLogs,
  serverConnected,
  serverDisconnected,
  fetchedData,
  fetchingData,
  calibrateSensor,
  initSensorCalibration,
  setSensorMessage,
} from "./sensorsSlice";

// TODO: ajouter fonction de gestions des erreurs de requêtes

export const ApiGetServerConfig = () => async (dispatch, getState) => {
  try {
    dispatch(fetchingData());
    const response = await fetch("/api/getConfig");
    const body = await response.json();
    const serverConfig = JSON.parse(body.apiAnswer);

    console.log(serverConfig);
    const { logInterval, start_log, sensors } = serverConfig;
    dispatch(serverConnected());
    dispatch(changeLogsInterval(logInterval));
    dispatch(setSensors(sensors));

    const isAcquisitionOn = !!start_log;
    if (getState().log.isToggleOn !== isAcquisitionOn) {
      dispatch(toggleLogs());
    }

    dispatch(fetchedData());

    if (response.status !== 200) {
      throw Error(body.message);
    }
  } catch (err) {
    dispatch(serverDisconnected());
  }
};

export const ApiChangeLogsInterval = (newInterval, post) => async (
  dispatch
) => {
  try {
    const response = await fetch(
      "/api/updateLogInterval?cmd_id=update_interval&interval=" + newInterval,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post }),
      }
    );
    const body = await response.text();
    if (response.status !== 200) throw Error(body.message);
    dispatch(changeLogsInterval(newInterval));
  } catch (err) {
    dispatch(serverDisconnected());
  }
};

export const ApiToggleLogs = (post) => async (dispatch, getState) => {
  try {
    const logCommand = getState().log.isToggleOn ? "stop" : "start";
    console.log({ logCommand });

    const response = await fetch(`/api/command?cmd_id=${logCommand}Log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // récupération de la réponse du serveur http
      body: JSON.stringify({ post }),
    });
    const body = await response.text();
    if (response.status !== 200) throw Error(body.message);
    dispatch(toggleLogs(body));
    return body;
  } catch (err) {
    dispatch(serverDisconnected());
  }
};

export const ApiGetSensorInfo = (sensorId) => async (dispatch, getState) => {
  try {
    const response = await fetch(`/api/sensorInfo?sensorId=${sensorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.text();
    if (response.status !== 200) throw Error(body.message);
    // TODO: ajouter logique dans reducer
  } catch (err) {}
};

export const ApiInitSensorCalibration = (sensorId) => async (
  dispatch,
  getState
) => {
  try {
    const response = await fetch(`/api/initCalibration?sensorId=${sensorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.text();
    if (response.status !== 200) throw Error(body.message);
    dispatch(initSensorCalibration(sensorId));
  } catch (err) {}
};

export const ApiCalibrateSensor = (sensorId) => async (dispatch, getState) => {
  try {
    const response = await fetch(`/api/calibrate?sensorId=${sensorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.text();
    console.log("BODY");
    console.log(body);
    let apiAnswer = JSON.parse(JSON.parse(body).apiAnswer).calibrationAnswer;
    // apiAnswer = JSON.parse(apiAnswer);

    console.log(apiAnswer);
    const { message } = apiAnswer;
    if (response.status !== 200) throw Error(body.message);
    dispatch(calibrateSensor(sensorId));
    dispatch(setSensorMessage({ sensorId, message }));
  } catch (err) {}
};
