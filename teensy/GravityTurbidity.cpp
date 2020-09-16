#include "GravityTurbidity.h"
#include "Config.h"
#include "Debug.h"

GravityTurbidity::GravityTurbidity():ledPin(TURBPINLED),sensorIn(TURBPINSENSOR) 
{
	_sensorId = turbiditySensor;
}

GravityTurbidity::~GravityTurbidity() 
{
}

void GravityTurbidity::setPin(int pin)
{
	this->ledPin = pin;
}

void GravityTurbidity::setup()
{
		Debug::println("Initializing Turbidity Sensor");
		this->calibrationStep = TURB_CALIBRATION_STEP;
		this->calibrationCurrentStep = 0;
		if (this->calibrationCurrentStep == this->calibrationStep )
		{
			this->sensorIsCalibrate = true;
		}
		else
		{
			this->sensorIsCalibrate = false;
		}

	    pinMode(this->ledPin,INPUT);	 // Set ledPin to output mode
	    pinMode(this->sensorIn, INPUT);       //Set the turbidity sensor pin to input mode

}

void GravityTurbidity::update()
{
	int sensorValue = analogRead(this->sensorIn);// read the input on analog:
	Serial.print("Before convert - Turbidity Sensor update : " );
	Serial.println(sensorValue);
  	turbidityValue = sensorValue * (3.3 / 4096.0); // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
	Serial.print("Turbidity Sensor update : " );
	Serial.println(turbidityValue);
}

double GravityTurbidity::getValue()
{
	return turbidityValue;
}

String GravityTurbidity::getCalibrationMessage() {
	const String calibrationMessage[TURB_CALIBRATION_STEP] = {
		// "\"message\":\" INIT Calibration Turbidity step 0\"",
		// "\"message\":\" calibration Gravity Turbidity step 1 \"",
		// "\"message\":\" calibration Gravity Turbidity step 2  \""
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