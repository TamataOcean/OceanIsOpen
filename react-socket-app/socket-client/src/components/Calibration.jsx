import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CalibrationStepper from "./CalibrationStepper";
import { logos } from "../features/sensorsSlice";
import { Typography } from "@material-ui/core";

const Calibration = () => {
  const dispatch = useDispatch();
  const sensors = useSelector((state) => state.sensors);

  return (
    <>
      <Typography variant="h2">Calibration</Typography>
      {sensors.map((sensor) => (
        <CalibrationStepper
          key={sensor.sensorId}
          steps={["1", "2", "3"]}
          stepsContent={[
            "Étape 1",
            "C'est la deuxième",
            "Jamais deux sans trois",
          ]}
          optionalSteps={[1]}
          title={sensor.sensorName}
          logoSrc={logos[sensor.sensorName]}
        />
      ))}
    </>
  );
};

export default Calibration;
