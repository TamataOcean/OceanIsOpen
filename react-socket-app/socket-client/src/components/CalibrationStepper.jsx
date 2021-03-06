import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Step,
  Stepper,
  StepLabel,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import {
  ApiCalibrateSensor,
  ApiInitSensorCalibration,
} from "../features/sensorsAPI";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginBottom: theme.spacing(3),
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  cardHeader: {
    paddingBottom: 0,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

const CalibrationStepper = ({ logoSrc, sensor }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [skipped, setSkipped] = React.useState(new Set());

  const title = sensor.sensorName;
  const currentStep = sensor.calibrationCurrentStep;
  const steps = new Array(sensor.calibrationStep).fill("");

  const isStepOptional = (step) => {
    // if (optionalSteps) {
    //   return optionalSteps.includes(step);
    // }
    return false;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(currentStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(currentStep);
    }

    dispatch(ApiCalibrateSensor(sensor.sensorId));
    // setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleSkip = () => {
    if (!isStepOptional(currentStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    // setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(currentStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    dispatch(ApiInitSensorCalibration(sensor.sensorId));
  };

  const handleInit = () => {
    dispatch(ApiCalibrateSensor(sensor.sensorId));
  };


  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Avatar
            aria-label="Sensor Logo"
            className={classes.large}
            src={logoSrc}
          />
        }
        title={title}
        titleTypographyProps={{ variant: "h5" }}
      />
      <CardContent>
        <Stepper activeStep={currentStep-1}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            if (isStepOptional(index)) {
              labelProps.optional = (
                <Typography variant="caption">Optionnelle</Typography>
              );
            }
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={title + label + index} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <div>
          {currentStep === steps.length ? (
            <div>
              <Typography className={classes.instructions}>
                {sensor.message}
                {/* Toutes les étapes sont terminées, le capteur est calibré. */}
              </Typography>
              <Button onClick={handleReset} className={classes.button}>
                Réinitialiser
              </Button>
            </div>
          ) : (
            <div>
              <Typography className={classes.instructions}>
                {sensor.message}
              </Typography>
              <div>
                {isStepOptional(currentStep) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSkip}
                    className={classes.button}
                  >
                    Passer
                  </Button>
                )}
                {currentStep === 0 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInit}
                    className={classes.button}
                  >
                    Commencer la calibration
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalibrationStepper;
