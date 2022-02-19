#pragma once
#include "Arduino.h"
#include "ISensor.h"
#include "Config.h"

#define ReceivedBufferLength 10  //length of the Serial CMD buffer

class GravityEc : public ISensor
{
public:
	// EC sensor pin
	int pin;	
	// offset compensation
	float offset;
	GravityEc();
	~GravityEc();

public:
	void setup();
	void update();
	double getValue();
	void setKValue(float value);
  	String getCalibrationMessage();
	void calibrate();
	void calibration(float voltage, float temperature,char* cmd);
	float kValue;
	
	int status; // 0 - to calibrate, 1 - Put the probe into solution, 2 - calibrated
	int messageId;

private:
	float  _ecvalue;
    float  _kvalue;
    float  _kvalueLow;
    float  _kvalueHigh;
    float  _voltage;
    float  _temperature;
    float  _rawEC;

    char   _cmdReceivedBuffer[ReceivedBufferLength];  //store the Serial CMD
    byte   _cmdReceivedBufferIndex;

	void    ecCalibration(byte mode); // calibration process, wirte key parameters to EEPROM
    byte    cmdParse(const char* cmd);
};
