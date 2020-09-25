import React from "react";
import { useSelector } from "react-redux";
import CalibrationStepper from "./CalibrationStepper";
import { logos } from "../features/sensorsSlice";
import { Typography } from "@material-ui/core";

const Calibration = () => {
  const sensors = useSelector((state) => state.sensors);

  return (
    <>
      <Typography variant="h2">Calibration</Typography>
      {sensors.map((sensor) => (
        <CalibrationStepper
          key={sensor.sensorId}
          title={sensor.sensorName}
          sensor={sensor}
          logoSrc={logos[sensor.sensorName]}
        />
      ))}
    </>
  );
};

export default Calibration;
