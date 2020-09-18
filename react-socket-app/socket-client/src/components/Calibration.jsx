import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CalibrationStepper from "./CalibrationStepper";
import { logos } from "../features/sensorsSlice";

const Calibration = () => {
  const dispatch = useDispatch();
  const sensors = useSelector((state) => state.sensors);

  return (
    <div>
      <CalibrationStepper />
      <h1>Calibration</h1>
      {sensors.map((sensor) => (
        <div key={sensor.sensorId}>
          <p>{sensor.sensorName}</p>
          <img src={logos[sensor.sensorName]} alt="Logo" />
        </div>
      ))}
      <pre>
        <code>{JSON.stringify(sensors, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Calibration;
