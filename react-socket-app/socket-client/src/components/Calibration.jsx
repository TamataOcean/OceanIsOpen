import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CalibrationStepper from "./CalibrationStepper";

const Calibration = () => {
  const dispatch = useDispatch();
  const sensors = useSelector((state) => state.sensors);

  return (
    <div>
      <CalibrationStepper />
      <h1>Calibration</h1>
      {sensors.map((sensor) => (
        <p>{sensor.name}</p>
      ))}
      <pre>
        <code>{JSON.stringify(sensors, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Calibration;
