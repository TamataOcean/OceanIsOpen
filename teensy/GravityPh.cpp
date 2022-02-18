/*  GravityPh.cpp

  Copyright (C)    2017   [DFRobot](http://www.dfrobot.com),
  GitHub Link :https://github.com/DFRobot/watermonitor
  This Library is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Description:Monitoring water quality parameters ph

  Product Links:http://www.dfrobot.com.cn/goods-812.html

  Sensor driver pin:A2 (pin(A2))

  author  :  Jason(jason.ling@dfrobot.com)
  version :  V1.0
  date    :  2017-04-07
**********************************************************************/
#include "Debug.h"
#include "GravityPh.h"
#include <EEPROM.h>

#define EEPROM_write(address, p) {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) EEPROM.write(address+i, pp[i]);}
#define EEPROM_read(address, p)  {int i = 0; byte *pp = (byte*)&(p);for(; i < sizeof(p); i++) pp[i]=EEPROM.read(address+i);}
#define PHVALUEADDR 0x00    //the start address of the pH calibration parameters stored in the EEPROM

extern uint16_t readMedianValue(int* dataArray, uint16_t arrayLength);

GravityPh::GravityPh(): pin(PHPIN), offset(0.0f)
{
  _sensorId = phSensor;
  sensorName = "GravityPH";
  unit = "pH";
  calibrationCurrentStep = 0;
  this->_temperature    = 25.0;
  this->_phValue        = 7.0;
  this->_acidVoltage    = 2032.44;    //buffer solution 4.0 at 25C
  this->_neutralVoltage = 1500.0;     //buffer solution 7.0 at 25C
  this->_voltage        = 1500.0;
  this->status          = 0;
  this->messageId       = 0;
}

//********************************************************************************************
// function name: setup ()
// Function Description: Initializes the ph sensor
//********************************************************************************************
void GravityPh::setup()
{
  Serial.println("---------- SETUP FOR PH SENSOR BEGIN --------- ");
  this->calibrationStep = PH_CALIBRATION_STEP;
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

  EEPROM_read(PHVALUEADDR, this->_neutralVoltage);  //load the neutral (pH = 7.0)voltage of the pH board from the EEPROM
    Serial.print(String(TEENSYNAME) + " - _neutralVoltage:");
    Serial.println(this->_neutralVoltage);
    if(EEPROM.read(PHVALUEADDR)==0xFF && EEPROM.read(PHVALUEADDR+1)==0xFF && EEPROM.read(PHVALUEADDR+2)==0xFF && EEPROM.read(PHVALUEADDR+3)==0xFF){
        this->_neutralVoltage = 1500.0;  // new EEPROM, write typical voltage
        EEPROM_write(PHVALUEADDR, this->_neutralVoltage);
    }
    EEPROM_read(PHVALUEADDR+4, this->_acidVoltage);//load the acid (pH = 4.0) voltage of the pH board from the EEPROM
    Serial.print(String(TEENSYNAME) + " - _acidVoltage:");
    Serial.println(this->_acidVoltage);
    if(EEPROM.read(PHVALUEADDR+4)==0xFF && EEPROM.read(PHVALUEADDR+5)==0xFF && EEPROM.read(PHVALUEADDR+6)==0xFF && EEPROM.read(PHVALUEADDR+7)==0xFF){
        this->_acidVoltage = 2032.44;  // new EEPROM, write typical voltage
        EEPROM_write(PHVALUEADDR+4, this->_acidVoltage);
    }

  //phRobot.begin();
}


//********************************************************************************************
// function name: update ()
// Function Description: Update the sensor value
//********************************************************************************************
void GravityPh::update()
{

  double averageVoltage = 0;

  for (uint8_t i = 0; i < ARRAYLENGTH; i++)
  {
    pHArray[i] = analogRead(this->pin);
    delay(10);
  }
  averageVoltage = readMedianValue(pHArray, ARRAYLENGTH);
  averageVoltage = averageVoltage * 3.3 / 4096.0;
  this->_phValue = 3.5 * averageVoltage + this->offset;

}

//********************************************************************************************
// function name: updateCS ()
// Function Description: Update the sensor value from DFRobot code
//********************************************************************************************
void GravityPh::updateCS()
{
float slope = (7.0-4.0)/((this->_neutralVoltage-1500.0)/3.0 - (this->_acidVoltage-1500.0)/3.0);  // two point: (_neutralVoltage,7.0),(_acidVoltage,4.0)
  float intercept =  7.0 - slope*(this->_neutralVoltage-1500.0)/3.0;
  //Serial.print("slope:");
  //Serial.print(slope);
  //Serial.print(",intercept:");
  //Serial.println(intercept);
  this->_phValue = slope*(this->_voltage-1500.0)/3.0+intercept;  //y = k*x + b
  return this->_phValue;

}

void GravityPh::initCalibration(){
  this->calibrationCurrentStep = 0;
  this->status = 0;
  this->messageId = 0;

}

//********************************************************************************************
// function name: calibrate ()
// Function Description: Update the sensor value with DFRobot library
// cmd =
//	"ENTERPH" modeIndex = 1;
//		Serial.println(F(">>>Enter PH Calibration Mode<<<"));
//	Serial.println(F(">>>Please put the probe into the 4.0 or 7.0 standard buffer solution<<<"));
//  "CALPH"  modeIndex = 2;
//
//  "EXITPH" modeIndex = 3;
//********************************************************************************************
void GravityPh::calibrate()
{
  Serial.println(String(TEENSYNAME) + " - GravityPH calibrate function with status = " + String(status));
  // READ PH VOLTAGE
  analogReadResolution(16);
	voltagePH = analogRead(PHPIN) / 65535.0 * 3300; // read the voltage
  	// ARRONDI AVEC 1 DECIMAL 
  	voltagePH = (round(voltagePH * 10));
  	voltagePH = voltagePH / 10;
    
  Serial.println(String(TEENSYNAME) + " - GravityPH voltage = " + String(voltagePH) );

  if (status == 0 ) {
	Serial.println(String(TEENSYNAME) + " - Gravity command : ENTERPH" );
    this->calibration(voltagePH, temperature, "ENTERPH" ); // convert voltage to pH with temperature compensation
  }
  else if ( status == 1 ) {
	Serial.println(String(TEENSYNAME) + " - Gravity command : CALPH" );
    this->calibration(voltagePH, temperature, "CALPH" ); // convert voltage to pH with temperature compensation
  }
  else if ( status == 2 ) {
	Serial.println(String(TEENSYNAME) + " - Gravity command : ExitPH" );
    this->calibration(voltagePH, temperature, "EXITPH" ); // convert voltage to pH with temperature compensation
  }
  else {
    Serial.println(String(TEENSYNAME) + " - Calibrate function error on status");
  }

  Serial.println(String(TEENSYNAME) + " - GravityPH calibrate function exit status = " + String(status));
}


//********************************************************************************************
// function name: getValue ()
// Function Description: Returns the sensor data
//********************************************************************************************
double GravityPh::getValue()
{
  analogReadResolution(16);
  //Reading voltage 
  this->_voltage = analogRead(PHPIN) / 65535.0 * 3300; // read the voltage
  // ARRONDI AVEC 1 DECIMAL 
  this->_voltage = (round(this->_voltage * 10));
  this->_voltage = this->_voltage / 10;

  float slope = (7.0-4.0)/((this->_neutralVoltage-1500.0)/3.0 - (this->_acidVoltage-1500.0)/3.0);  // two point: (_neutralVoltage,7.0),(_acidVoltage,4.0)
  float intercept =  7.0 - slope*(this->_neutralVoltage-1500.0)/3.0;
  //Serial.print("slope:");
  //Serial.print(slope);
  //Serial.print(",intercept:");
  //Serial.println(intercept);
  Debug::println(String(TEENSYNAME) + " - getValue voltage = : " + String(this->_voltage) );
  this->_phValue = slope*(this->_voltage-1500.0)/3.0+intercept;  //y = k*x + b
  return this->_phValue;
}

void GravityPh::setOffset(float offset)
{
  this->offset = offset;
}

void GravityPh::calibration(float voltage, float temperature,char* cmd)
{
	Serial.println(String(TEENSYNAME) + " - calibration process enter cmd = " + String(cmd));
    this->_voltage = voltage;
	this->_temperature = temperature;
    //strupr(cmd); NOT WORKING
    this->phCalibration(cmdParse(cmd));  // if received Serial CMD from the serial monitor, enter into the calibration mode
}

byte GravityPh::cmdParse(const char* cmd)
{
	//Serial.println("Entering into cmdParse");
    byte modeIndex = 0;
    if(strstr(cmd, "ENTERPH")      != NULL){
        Serial.println(String(TEENSYNAME) + " - cmdParse = ENTERPH" );
        modeIndex = 1;
    }else if(strstr(cmd, "CALPH")  != NULL){
        Serial.println(String(TEENSYNAME) + " - cmdParse = CALPH" );
        modeIndex = 2;
    }else if(strstr(cmd, "EXITPH") != NULL){
        Serial.println(String(TEENSYNAME) + " - cmdParse = EXITPH" );
        modeIndex = 3;
    }
	//Serial.println("Exit cmdParse modeIndex = "+ String(modeIndex));
    return modeIndex;
}

String GravityPh::getCalibrationMessage() {

	//int phStatus = phRobot.getStatus();
	String json = "{\"calibrationAnswer\":{";
	json += "\"sensorId\":"+ (String)_sensorId + ",";
	json += "\"calibrationCurrentStep\":" + (String)this->calibrationCurrentStep +",";
	json += "\"isCalibrate\":" + (String)this->isCalibrate()+ ",";
	
	const String calibrationMessage[] = {
		"\"message\":\" PH Probe need calibration - Please launch the calibration process\"",                                   //0
		"\"message\":\" INIT Calibration PH launched - Please put the probe into the 4.0 or 7.0 standard buffer solution\"",		//1
    	"\"message\":\" Buffer solution 7.0 detected - Save & Exit\"",                                                                   //2
		"\"message\":\" Buffer solution 4.0 detected - Save & Exit\"",                                                                   //3
		"\"message\":\" Buffer Solution Error Try Again\"",                                                                     //4
		"\"message\":\" Calibration successfull\"",                                                                             //5
		"\"message\":\" Calibration failed\""                                                                                   //6
	};

	if (this->isCalibrate()) {
		json += "\"message\":\"Sensor is calibrate \"";
	}
	else {
		//Depending on status 
		json += calibrationMessage[this->messageId];
	}

	json += "}}";
	return json;
}

void GravityPh::phCalibration(byte mode)
{
    Serial.println( String(TEENSYNAME) + " - DFRobot_PH.phCalibration() begin");
    char *receivedBufferPtr;
    static boolean phCalibrationFinish  = 0;
    static boolean enterCalibrationFlag = 0;
    switch(mode){
        case 0:
        if(enterCalibrationFlag){
            Serial.println(F(">>>Command Error<<<"));
        }
        break;

        case 1: // ENTERPH command
        this->sensorIsCalibrate = false;
        enterCalibrationFlag = 1;
        phCalibrationFinish  = 0;
        Serial.println();
        Serial.println(String(TEENSYNAME) + " - >>>Enter PH Calibration Mode<<<");
        Serial.println(String(TEENSYNAME) + " - >>>Please put the probe into the 4.0 or 7.0 standard buffer solution<<<");
        Serial.println();
        this->messageId = 1;
		this->status = 1;
		this->calibrationCurrentStep = 1;
        break;

        case 2: // CALPH command
        if(enterCalibrationFlag){
            if((this->_voltage>1322)&&(this->_voltage<1678)){        // buffer solution:7.0{
                Serial.println();
                Serial.println(String(TEENSYNAME) + " - >>>Buffer Solution:7.0");
                this->_neutralVoltage =  this->_voltage;
                Serial.println(String(TEENSYNAME) + " - ,Send EXITPH to Save and Exit<<<");
                Serial.println();
                phCalibrationFinish = 1;
                this->messageId = 2;
				this->status = 2;
				this->calibrationCurrentStep = 2;

            }else if((this->_voltage>1854)&&(this->_voltage<2210)){  //buffer solution:4.0
                Serial.println();
                Serial.println(String(TEENSYNAME) + " - >>>Buffer Solution:4.0");
                this->_acidVoltage =  this->_voltage;
                Serial.println(String(TEENSYNAME) + " - ,Send EXITPH to Save and Exit<<<"); 
                Serial.println();
                phCalibrationFinish = 1;
                this->messageId = 3;
				this->status = 2;
				this->calibrationCurrentStep = 2;

            }else{
                Serial.println();
                Serial.println(String(TEENSYNAME) + " - >>>Buffer Solution Error Try Again<<<");
                Serial.println(String(TEENSYNAME) + " - >>> _voltage = " + String(_voltage));                                  // not buffer solution or faulty operation
                Debug::println(String(TEENSYNAME) + " - >>> Buffer Solution Error Try Again");
                Debug::println(String(TEENSYNAME) + " - >>> _voltage =" + String(this->_voltage));
                
                phCalibrationFinish = 0;
                this->messageId = 4;
				this->status = 2;
            }
        }
        break;

        case 3: // Exit & Save command
        if(enterCalibrationFlag){
            Serial.println();
            if(phCalibrationFinish){
                if((this->_voltage>1322)&&(this->_voltage<1678)){
                    EEPROM_write(PHVALUEADDR, this->_neutralVoltage);
                }else if((this->_voltage>1854)&&(this->_voltage<2210)){
                    EEPROM_write(PHVALUEADDR+4, this->_acidVoltage);
                }
                Serial.print(F(">>>Calibration Successful"));
                Debug::println(String(TEENSYNAME) + " - >>>Calibration Successful");
                this->status = 2;
                this->messageId = 5;
                this->sensorIsCalibrate = true;
				this->calibrationCurrentStep = 3;
            }else{
                Serial.print(F(">>>Calibration Failed"));
                Debug::println(String(TEENSYNAME) + " - >>>Calibration Failed");
                
                this->status = 0;
                this->sensorIsCalibrate = false;
                this->messageId = 6;
				this->calibrationCurrentStep = 0;

            }
            Serial.println(F(",Exit PH Calibration Mode<<<"));
            Debug::println(String(TEENSYNAME) + " - >>>Exit PH Calibration Mode<<<");
                
            Serial.println();
            phCalibrationFinish  = 0;
            enterCalibrationFlag = 0;
        }
        break;
    }
}