import { changeLogsInterval, toggleLogs } from "./sensorsSlice";

export const ApiSayHello = () => async (dispatch, getState) => {
  try {
    const response = await fetch("/api/hello");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
  } catch (err) {}
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
  } catch (err) {}
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
  } catch (err) {}
};
