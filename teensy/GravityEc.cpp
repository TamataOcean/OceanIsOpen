#include "GravityEc.h"
#include "Config.h"

#define RES2 (7500.0/0.66)
#define ECREF 20.0

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityEc::GravityEc() :kValue(ECKVALUE), pin(ECPIN)
{
	_sensorId = ecSensor;
	sensorName = "GravityEC";
	unit = "Volt";

}


GravityEc::~GravityEc()
{
}

void GravityEc::setup()
{
	this->calibrationStep = EC_CALIBRATION_STEP;
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
}


void GravityEc::update()
{
	int ecValueBuffer[ARRAYLENGTH];
	float averageVoltage;
	for (uint8_t i = 0; i < ARRAYLENGTH; i++)
	{
		ecValueBuffer[i] = analogRead(this->pin);
		delay(10);
	}
	averageVoltage = readMedianValue(ecValueBuffer, ARRAYLENGTH)/4096.0*3300.0;
  float value = 0;
  value = 1000*averageVoltage/RES2/ECREF*this->kValue*10.0;
  this->ecValue = value;
}

double GravityEc::getValue()
{
	return this->ecValue;
}

void GravityEc::setKValue(float value)
{
	this->kValue = value;
}

String GravityEc::getCalibrationMessage() {
	const String calibrationMessage[EC_CALIBRATION_STEP] = {
		"\"message\":\" INIT Calibration EC step 0\"",
		"\"message\":\" calibration Gravity EC step 1 \"",
		"\"message\":\" calibration Gravity EC step 2  \""
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