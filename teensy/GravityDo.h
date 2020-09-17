#pragma once

#include "ISensor.h"
#include "Arduino.h"
#include "Config.h"

class GravityDo: public ISensor
{
public:
	GravityDo();
	~GravityDo();

public:
	void setup();
	void update();
  void setPin(int pin);
	double getValue();
  int getCalibrationStep();
  float getTemperature() const;
  void setTemperature(float temperature);
  String getCalibrationMessage();

private:
    int    _pin;
    int    _vref;
    float  _temperature;
	  double _doValue;

    float  _saturationDoVoltage;
    float  _saturationDoTemperature;
    float  _averageVoltage;
};  
