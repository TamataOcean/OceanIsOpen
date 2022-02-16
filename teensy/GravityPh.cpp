/*  GravityPh.cpp

  Copyright (C)    2017   [DFRobot](http://www.dfrobot.com),
  GitHub Link :https://github.com/DFRobot/watermonitor
  This Library is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Description:Monitoring water quality parameters ph

  Product Links：http://www.dfrobot.com.cn/goods-812.html

  Sensor driver pin：A2 (pin(A2))

  author  :  Jason(jason.ling@dfrobot.com)
  version :  V1.0
  date    :  2017-04-07
**********************************************************************/

#include "GravityPh.h"

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityPh::GravityPh(): pin(PHPIN), offset(0.0f), pHValue(0)
{
  _sensorId = phSensor;
  sensorName = "GravityPH";
  unit = "pH";

}

//********************************************************************************************
// function name: setup ()
// Function Description: Initializes the ph sensor
//********************************************************************************************
void GravityPh::setup()
{
  this->calibrationStep = PH_CALIBRATION_STEP;
  this->calibrationCurrentStep = 0;
  if (this->calibrationCurrentStep == this->calibrationStep )
  {
    this->sensorIsCalibrate = true;
  }
  else
  {
    this->sensorIsCalibrate = false;
  }
  pinMode(pin, INPUT);

  phRobot.begin();
}


//********************************************************************************************
// function name: update ()
// Function Description: Update the sensor value
//********************************************************************************************
void GravityPh::update()
{

  double averageVoltage = 0;

  for (uint8_t i = 0; i < ARRAYLENGTH; i++)
  {
    pHArray[i] = analogRead(this->pin);
    delay(10);
  }
  averageVoltage = readMedianValue(pHArray, ARRAYLENGTH);
  averageVoltage = averageVoltage * 3.3 / 4096.0;
  pHValue = 3.5 * averageVoltage + this->offset;

}

//********************************************************************************************
// function name: updateCS ()
// Function Description: Update the sensor value from ClubSanwithStudio code
//********************************************************************************************
void GravityPh::updateCS()
{
  // READ PH VOLTAGE
  voltagePH = analogRead(PHPIN) / 65535.0 * 3300; // read the voltage
  // ARRONDI AVEC 1 DECIMAL
  voltagePH = (round(voltagePH * 10));
  voltagePH = voltagePH / 10;

  // CALCULATE PH VALUE
  phValue = phRobot.readPH(voltagePH, temperature); // convert voltage to pH with temperature compensation
  // ARRONDI AVEC 1 DECIMAL
  phValue = (round(phValue * 10));
  phValue = phValue / 10;

}

//********************************************************************************************
// function name: calibrate ()
// Function Description: Update the sensor value with DFRobot library
// cmd =
//	"ENTERPH" modeIndex = 1;
//		Serial.println(F(">>>Enter PH Calibration Mode<<<"));
//	Serial.println(F(">>>Please put the probe into the 4.0 or 7.0 standard buffer solution<<<"));
//  "CALPH"  modeIndex = 2;
//
//  "EXITPH" modeIndex = 3;
//********************************************************************************************
void GravityPh::calibrate(String cmd)
{
  // READ PH VOLTAGE
	voltagePH = analogRead(PHPIN) / 65535.0 * 3300; // read the voltage
  	// ARRONDI AVEC 1 DECIMAL 
  	voltagePH = (round(voltagePH * 10));
  	voltagePH = voltagePH / 10;

	
    phRobot.calibration(voltagePH, temperature, cmd.c_str()); // convert voltage to pH with temperature compensation
	//calibrationCurrentStep += 1;
	
	if (phRobot.getStatus()== 5 ) {
		calibrationCurrentStep = PH_CALIBRATION_STEP;
	}
}


//********************************************************************************************
// function name: getValue ()
// Function Description: Returns the sensor data
//********************************************************************************************
double GravityPh::getValue()
{
  return this->pHValue;
}

void GravityPh::setOffset(float offset)
{
  this->offset = offset;
}

String GravityPh::getCalibrationMessage() {

	//int phStatus = phRobot.getStatus();
	String json = "{\"calibrationAnswer\":{";
	json += "\"sensorId\":"+ (String)_sensorId + ",";
	json += "\"calibrationCurrentStep\":" + (String)this->calibrationCurrentStep +",";
	json += "\"isCalibrate\":" + (String)this->isCalibrate()+ ",";
	
	const String calibrationMessage[] = {
		"\"message\":\" PH Probe need calibration - Please launch the calibration process\"",
		"\"message\":\" INIT Calibration PH launched - Please put the probe into the 4.0 or 7.0 standard buffer solution\"",		"\"message\":\" calibration Gravity PH step 1 \"",	
		"\"message\":\" Buffer solution 7.0\n Save & Exit\"",
		"\"message\":\" Buffer solution 4.0\n Save & Exit\"",
		"\"message\":\" Buffer Solution Error Try Again\"",
		"\"message\":\" Calibration successfull\"",
		"\"message\":\" Calibration failed\""
		
	};

	if (this->isCalibrate()) {
		json += "\"message\":\"Sensor is calibrate \"";
	}
	else {
		//Depending on status 
		json += calibrationMessage[this->phRobot.getStatus()];
	}

	json += "}}";
	return json;
}
