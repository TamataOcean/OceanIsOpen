export const logRecord = () => {
  return {
    type: "LOG_RECORDING"
  };
};

export const logInterval = selectedChange => {
  return {
    type: "LOG_INTERVAL_CHANGE",
    selectedChange: selectedChange
  };
};
