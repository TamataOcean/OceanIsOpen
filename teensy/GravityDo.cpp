#include <avr/pgmspace.h>
//#include <EEPROM.h>

#include "GravityDo.h"


//#define EEPROM_write(address, p) {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) EEPROM.write(address+i, pp[i]);}
//#define EEPROM_read(address, p)  {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) pp[i]=EEPROM.read(address+i);}


#define SaturationDoVoltageAddress 12          //the address of the Saturation Oxygen voltage stored in the EEPROM
#define SaturationDoTemperatureAddress 16      //the address of the Saturation Oxygen temperature stored in the EEPROM

const float SaturationValueTab[41] PROGMEM = {      //saturation dissolved oxygen concentrations at various temperatures
14.46, 14.22, 13.82, 13.44, 13.09,
12.74, 12.42, 12.11, 11.81, 11.53,
11.26, 11.01, 10.77, 10.53, 10.30,
10.08, 9.86,  9.66,  9.46,  9.27,
9.08,  8.90,  8.73,  8.57,  8.41,
8.25,  8.11,  7.96,  7.82,  7.69,
7.56,  7.43,  7.30,  7.18,  7.07,
6.95,  6.84,  6.73,  6.63,  6.53,
6.41,
};

GravityDo::GravityDo()
{
	_sensorId = doSensor;
	sensorName = "GravityDo";
    _pin = DOPIN;
    _vref = 5000;
    _temperature = 25;
    _doValue = 0;
    
	_saturationDoVoltage = 1127.6;
	_saturationDoTemperature = 25.0;
    _averageVoltage = 0;
}

GravityDo::~GravityDo()
{

}

void GravityDo::setPin(int pin)
{
    this->_pin = pin;
	pinMode(this->_pin, INPUT);
   
}
void GravityDo::setTemperature(float temperature)
{
    this->_temperature = temperature;
}

void GravityDo::setup()
{
	this->calibrationStep = DO_CALIBRATION_STEP;
		this->calibrationCurrentStep = 0;
		if (this->calibrationCurrentStep == this->calibrationStep )
		{
			this->sensorIsCalibrate = true;
		}
		else
		{
			this->sensorIsCalibrate = false;
		}

	pinMode(this->_pin, INPUT);
}

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

void GravityDo::update()
{
	int analogBuffer[ARRAYLENGTH];

	for (uint8_t i = 0; i < ARRAYLENGTH; i++)
	{
		analogBuffer[i] = analogRead(this->_pin);
		delay(10);
	}

	this->_averageVoltage = readMedianValue(analogBuffer, ARRAYLENGTH) * (float)this->_vref / 1024.0; // read the value more stable by the median filtering algorithm
	this->_doValue = pgm_read_float_near(&SaturationValueTab[0] + (int)(this->_temperature + 0.5)) * this->_averageVoltage / this->_saturationDoVoltage;  //calculate the do value, doValue = Voltage / this->_saturationDoVoltage * SaturationDoValue(with temperature compensation)
}

double GravityDo::getValue()
{
    return this->_doValue;
}

float GravityDo::getTemperature() const
{
    return this->_temperature;
}

String GravityDo::getCalibrationMessage() {
	const String calibrationMessage[DO_CALIBRATION_STEP] = {
		"\"message\":\" INIT Calibration  DO step 0\"",
		"\"message\":\" calibration Gravity DO step 1 \"",
		"\"message\":\" calibration Gravity DO step 2  \"",
		"\"message\":\" calibration Gravity DO step 3  \"",
		"\"message\":\" calibration Gravity DO step 4  \""
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