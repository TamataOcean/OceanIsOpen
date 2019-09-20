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
		Serial.println("Initializing Turbidity Sensor");
	    pinMode(this->ledPin,INPUT);	 // Set ledPin to output mode
	    pinMode(this->sensorIn, INPUT);       //Set the turbidity sensor pin to input mode

}


void GravityTurbidity::update()
{
	int sensorValue = analogRead(this->sensorIn);// read the input on analog:
  	turbidityValue = sensorValue * (5.0 / 1024.0); // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):
	Serial.print("Turbidity Sensor update test: " );
	Serial.println(turbidityValue);
}

double GravityTurbidity::getValue()
{
	return turbidityValue;
}

