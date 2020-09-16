#pragma once

#include "ISensor.h"
#include "Arduino.h"
#include "Debug.h"

class GravityTurbidity: public ISensor
{
public:
	GravityTurbidity();
	~GravityTurbidity();

public:
	void setup();
	void update();
	double getValue();
    void setPin(int sensorIn);
  	String getCalibrationMessage();

private:
    int ledPin;
    int sensorIn;
    double turbidityValue = 0;
    
};  


