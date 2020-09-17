import {
  changeLogsInterval,
  toggleLogs,
  serverConnected,
  serverDisconnected,
  fetchedData,
  fetchingData,
} from "./sensorsSlice";

export const ApiGetServerConfig = () => async (dispatch, getState) => {
  try {
    dispatch(fetchingData());
    const response = await fetch("/api/getConfig");
    const body = await response.json();
    const serverConfig = JSON.parse(body.apiAnswer);

    console.log(serverConfig);
    const { logInterval, start_log } = serverConfig;
    dispatch(serverConnected());
    dispatch(changeLogsInterval(logInterval));

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
