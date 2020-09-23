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

#include "GravityTemperature.h"
#include "DallasTemperature.h"
#include <OneWire.h>
#include "Debug.h"

GravityTemperature::GravityTemperature(int pin)
{
	_sensorId = temperatureSensor;
	sensorName = "Temperature";
	unit = "°C";
	this->calibrationStep = 0;
	this->calibrationCurrentStep = TEMP_CALIBRATION_STEP;
	
	this->oneWire = new OneWire(pin);
	this->update();
}

GravityTemperature::~GravityTemperature()
{
}


//********************************************************************************************
// function name: setup ()
// Function Description: Initializes the sensor
//********************************************************************************************
void GravityTemperature::setup()
{
	this->calibrationStep = TEMP_CALIBRATION_STEP;
		this->calibrationCurrentStep = 0;
		if (this->calibrationCurrentStep == this->calibrationStep )
		{
			this->sensorIsCalibrate = true;
		}
		else
		{
			this->sensorIsCalibrate = false;
		}

}


//********************************************************************************************
// function name: update ()
// Function Description: Update the sensor value
//********************************************************************************************
void GravityTemperature::update()
{
	Debug::println("Update Temperature Sensor...");
	if ( millis () - tempSampleTime >= tempSampleInterval)
	{
		tempSampleTime = millis ();
		temperature = TempProcess(ReadTemperature);  // read the current temperature from the  DS18B20
		TempProcess(StartConvert);                   //after the reading, start the convert for next reading
	}
}


//********************************************************************************************
// function name: getValue ()
// Function Description: Returns the sensor data
//********************************************************************************************
double GravityTemperature::getValue()
{
	return temperature;
}


//********************************************************************************************
// function name: TempProcess ()
// Function Description: Analyze the temperature data
//********************************************************************************************
double GravityTemperature::TempProcess(bool ch)
{
	static byte data[12];
	static byte addr[8];
	static float TemperatureSum;
	if (!ch) {
		if (!oneWire->search(addr)) {
			Debug::println(F("no temperature sensors on chain, reset search!"));
			oneWire->reset_search();
			return 0;
		}
		if (OneWire::crc8(addr, 7) != addr[7]) {
			Debug::println(F("CRC is not valid!"));
			return 0;
		}
		if (addr[0] != 0x10 && addr[0] != 0x28) {
			Debug::println(F("Device is not recognized!"));
			return 0;
		}
		oneWire->reset();
		oneWire->select(addr);
		oneWire->write(0x44, 1); // start conversion, with parasite power on at the end
	}
	else {
		byte present = oneWire->reset();
		oneWire->select(addr);
		oneWire->write(0xBE); // Read Scratchpad
		for (int i = 0; i < 9; i++) { // we need 9 bytes
			data[i] = oneWire->read();
		}
		oneWire->reset_search();
		byte MSB = data[1];
		byte LSB = data[0];
		float tempRead = ((MSB << 8) | LSB); //using two's compliment
		TemperatureSum = tempRead / 16;
	}
	return TemperatureSum;
}

String GravityTemperature::getCalibrationMessage() {
	const String calibrationMessage[TEMP_CALIBRATION_STEP] = {
		// "\"message\":\" INIT Calibration Temperature step 0\"",
		// "\"message\":\" calibration Gravity Temperature step 1 \"",
		// "\"message\":\" calibration Gravity Temperature step 2  \""
	};
	
	String json = "{\"calibrationAnswer\":{";
	json += "\"sensorId\":"+ (String)_sensorId + ",";
	json += "\"calibrationCurrentStep\":" + (String)this->calibrationCurrentStep +",";
	json += "\"isCalibrate\":" + (String)this->isCalibrate()+ ",";
	
	if (this->isCalibrate()) {
		json += "\"message\":\"Sensor is calibrate \"";
	}
	else {
		json += calibrationMessage[this->calibrationCurrentStep];
	}

	json += "}}";
	return json;
}