/*********************************************************************
* GravityOrp.cpp
*
* Copyright (C)    2017   [DFRobot](http://www.dfrobot.com),
* GitHub Link :https://github.com/DFRobot/watermonitor
* This Library is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Description:Monitoring water quality parameters Oxidation-Reduction Potential
*
* Product Links：http://www.dfrobot.com.cn/goods-840.html
*
* Sensor driver pin：A3 (pin(A3))
*
* author  :  Jason(jason.ling@dfrobot.com)
* version :  V1.0
* date    :  2017-04-14
**********************************************************************/

#include "GravityOrp.h"


extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityOrp::GravityOrp():pin(ORPPIN), voltage(3.3), offset(0), orpValue(0.0)
{
}

GravityOrp::~GravityOrp()
{
}

//********************************************************************************************
// Function name: setup()
// Function description: Initialize the sensor
//********************************************************************************************
void GravityOrp::setup()
{
	this->calibrationStep = ORP_CALIBRATION_STEP;
		this->calibrationCurrentStep = 0;
		if (this->calibrationCurrentStep == this->calibrationStep )
		{
			this->sensorIsCalibrate = true;
		}
		else
		{
			this->sensorIsCalibrate = false;
		}
	pinMode(this->pin, INPUT);
}

//********************************************************************************************
// Function name: update()
// Function description: update sensor value
//********************************************************************************************
void GravityOrp::update()
{
	double averageValue = 0;
	for (uint8_t i = 0; i < ARRAYLENGTH; i++)
	{
		orpArray[i] = analogRead(this->pin);    //read an analog value every 20ms
		delay(10);
	}
	averageValue = readMedianValue(orpArray, ARRAYLENGTH);
	this->orpValue = ((30 * this->voltage * 1000) - (75 * averageValue*this->voltage * 1000 / 4096)) / 75 - this->offset;
}


//********************************************************************************************
// Function name: getValue()
// Function Description: Return sensor data
//********************************************************************************************
double GravityOrp::getValue()
{
	return this->orpValue;
}
