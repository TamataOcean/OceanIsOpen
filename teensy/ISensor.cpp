/*********************************************************************
* GravityTemperature.cpp
*
* Copyright (C)    2017   [DFRobot](http://www.dfrobot.com),
* GitHub Link :https://github.com/DFRobot/watermonitor
* This Library is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Description:
*
* author  :  Jason(jason.ling@dfrobot.com)
* version :  V1.0
* date    :  2017-04-12
**********************************************************************/

#include "ISensor.h"

/* CALIBRATION Management */
int ISensor::getCalibrationStep()
{
	return this->calibrationStep;
}

int ISensor::getCalibrationCurrentStep()
{
	return this->calibrationCurrentStep;
}

int ISensor::isCalibrate() {
    return this->sensorIsCalibrate;
}

String ISensor::getUnit() {
    return this->unit;
}
// String ISensor::getCalibrationMessage(int stepNumber) {
//     if ( stepNumber == 0 ) {
//     return "{\"initCalibrationAnswer\":{\"message\":\"Message INIT Calibration step0 ready\"}}";

//     }
//     else
//     {
//     return "{\"calibrateAnswer\":{\"message\":\"Message TEST Calibration step1\"}}";
//     }
    
// }

void ISensor::setCalibrationCurrentStep(int step)
{
    // control on max calibration step.
    if ( step <= this->calibrationStep  ){
	    this->calibrationCurrentStep = step;
    }

    if (this->calibrationCurrentStep == this->calibrationStep )
    {
        this->sensorIsCalibrate = true;
    }
    else
    {
        this->sensorIsCalibrate = false;
    }
    
    
}
