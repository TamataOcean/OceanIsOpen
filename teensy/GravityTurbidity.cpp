#include "GravityTurbidity.h"
#include "Config.h"
#include "Debug.h"

GravityTurbidity::GravityTurbidity():ledPin(TURBPINLED),sensorIn(TURBPINSENSOR) 
{
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
    if ( this->calibrationCurrentStep == 0 ) {
    	return "{\"initCalibrationAnswer\":{\"message\":\"Message INIT Calibration step0 GravityTurbidity \"}}";
    }
    else
    {
    	return "{\"calibrateAnswer\":{\"message\":\"Message TEST Calibration Gravity Turbidity step1\"}}";
    }
}