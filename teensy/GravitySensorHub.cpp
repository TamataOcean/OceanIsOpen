/* GravitySensorHub.cpp
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
********************************************************************************************/


#include "GravitySensorHub.h"
#include "GravityPh.h"
#include "GravityOrp.h"
#include "GravityEc.h"
#include "GravityTDS.h"
#include "GravityTemperature.h"
#include "GravityDo.h"
#include "GravityTurbidity.h"

#include "Config.h"
#include "Debug.h"


//********************************************************************************************
// function name: sensors []
// Function Description: Store the array of sensors
// Parameters: 0 ph sensor
// Parameters: 1 temperature sensor
// Parameters: 2 Dissolved oxygen sensor
// Parameters: 3 Conductivity sensor
// Parameters: 4 Redox potential sensor
//********************************************************************************************

GravitySensorHub::GravitySensorHub()
{
	Debug::println("Initialize GravitySensorHub...");
	Debug::println("mqttUser = " + (String)MQTTUSER);
	Debug::println("------------------------------");
	
	for (size_t i = 0; i < this->SensorCount; i++)
	{
		this->sensors[i] = NULL;
	}

	this->sensors[phSensor] = new GravityPh();
	this->sensors[temperatureSensor] = new GravityTemperature(TEMPPIN);
	this->sensors[doSensor] = new GravityDo();
	#ifdef SELECTEC
		this->sensors[ecSensor] = new GravityEc();
	#endif
	#ifdef SELECTTDS
		this->sensors[tdsSensor] = new GravityTDS();
	#endif

	this->sensors[orpSensor] = new GravityOrp();
	this->sensors[turbiditySensor] = new GravityTurbidity();
}

//********************************************************************************************
// function name: ~ GravitySensorHub ()
// Function Description: Destructor, frees all sensors
//********************************************************************************************
GravitySensorHub::~GravitySensorHub()
{
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (this->sensors[i])
		{
			delete this->sensors[i];
		}
	}
}


//********************************************************************************************
// function name: setup ()
// Function Description: Initializes all sensors
//********************************************************************************************
void GravitySensorHub::setup()
{
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (this->sensors[i])
		{
			this->sensors[i]->setup();
		}
	}
}


//********************************************************************************************
// function name: update ()
// Function Description: Updates all sensor values
//********************************************************************************************
void GravitySensorHub::update()
{
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (this->sensors[i])
		{
			this->sensors[i]->update();
		}
	}
}

//********************************************************************************************
// function name: getValueBySensorNumber ()
// Function Description: Get the sensor data
// Parameters: 0 ph sensor
// Parameters: 1 temperature sensor
// Parameters: 2 Dissolved oxygen sensor
// Parameters: 3 Conductivity sensor
// Parameters: 4 Redox potential sensor
// Return Value: Returns the acquired sensor data
//********************************************************************************************
double GravitySensorHub::getValueBySensorNumber(int num)
{
	if (num >= SensorCount)
	{
		return 0;
	}
	return this->sensors[num]->getValue();
}

String GravitySensorHub::getJsonSensorsUpdate()
{
	String json = "{\"state\":{\"reported\":{\"user\":\""+(String)MQTTUSER+"\",\"sensors\":[";	
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (i == SensorCount-2 ) {
			if (this->sensors[i]){
				// json += "\"sensor" + String(i) + "\":{";
				json += "{";
				json += "\"sensorId\":"+ (String)i + ",\"sensorName\":\""+ this->sensors[i]->sensorName + "\",\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate();
				json += ",\"unit\":\""+ (String)this->sensors[i]->getUnit() +"\"";
				json += ",\"value\":"+ (String)this->sensors[i]->getValue() ;
				json += "}";
			}	
		}
		else if (this->sensors[i]){
			// json += "\"sensor" + String(i) + "\":{";
			json += "{";
			json += "\"sensorId\":"+ (String)i + ",\"sensorName\":\""+ this->sensors[i]->sensorName + "\",\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate();
			json += ",\"unit\":\""+ (String)this->sensors[i]->getUnit() +"\"";
			json += ",\"value\":"+ (String)this->sensors[i]->getValue();
			json += "},";
		}
	}
	json += "]}}}";

	return json;
}

String GravitySensorHub::getCalibrationStatus(){
	String json = "{\"calibrationStatusAnswer\":{\"sensors\":{";	
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (i == SensorCount-2 ) {
			if (this->sensors[i]){
				json += "\""+ (String)this->sensors[i]->sensorName + "\":{\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate() + "}";
			}	
		}
		else if (this->sensors[i]){
			json += "\""+ (String)this->sensors[i]->sensorName + "\":{\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate() + "}" + ",";
		}
	}
	json += "} } }";

	return json;
}

String GravitySensorHub::getSensorInfo(int sensorId){
	String json = "{\"sensorInfoAnswer\":{";	
	json += "\"sensorId\":"+ (String)sensorId;
	json += ",\"sensorName\":\""+ (String)this->sensors[sensorId]->sensorName;
	json += "\",\"calibrationStep\":" + (String)this->sensors[sensorId]->getCalibrationStep();
	json += ",\"calibrationCurrentStep\":"+ (String)this->sensors[sensorId]->getCalibrationCurrentStep();
	json += ",\"isCalibrate\":"+ (String)this->sensors[sensorId]->isCalibrate();
	json += ",\"unit\":\""+ (String)this->sensors[sensorId]->getUnit() +"\"";
	json += ",\"value\":"+ (String)this->sensors[sensorId]->getValue() ;
	json += "}}";
	return json;
}

String GravitySensorHub::getSensorName(int sensorId){
	// String SensorName[SENSORCOUNT] = {"phSensor", "temperatureSensor", "doSensor", "ecSensor", "tdsSensor", "orpSensor", "turbiditySensor"};
	// return SensorName[sensorId];
	return this->sensors[sensorId]->sensorName;
}

double GravitySensorHub::getValue( int sensorId){
	return this->sensors[sensorId]->getValue();
}

String GravitySensorHub::getJsonConfig(){
	String json = "{";
	for (size_t i = 0; i < SensorCount; i++)
	{
		if (i == SensorCount-2 ) {
			if (this->sensors[i]){
				json += "\"sensor" + String(i) + "\":{";
				json += "\"sensorId\":"+ (String)i + ",\"sensorName\":\""+ this->sensors[i]->sensorName + "\",\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate();
				json += ",\"unit\":\""+ (String)this->sensors[i]->getUnit() +"\"";
				json += ",\"value\":"+ (String)this->sensors[i]->getValue() ;
				json += "}";
			}	
		}
		else if (this->sensors[i]){
			json += "\"sensor" + String(i) + "\":{";
			json += "\"sensorId\":"+ (String)i + ",\"sensorName\":\""+ this->sensors[i]->sensorName + "\",\"calibrationStep\":" + this->sensors[i]->getCalibrationStep() + ",\"calibrationCurrentStep\":"+ this->sensors[i]->getCalibrationCurrentStep() + ",\"isCalibrate\":"+ this->sensors[i]->isCalibrate();
			json += ",\"unit\":\""+ (String)this->sensors[i]->getUnit() +"\"";
			json += ",\"value\":"+ (String)this->sensors[i]->getValue();
			json += "},";
		}
	}
	json += "}";

	return json;

	// DynamicJsonDocument doc(1024);
	// deserializeJson(doc, SensorName);
	//doc["sensors"] = SensorName;
	//JsonObject sensor = doc.createNestedOject("SensorName");
	// return doc;
}


//sending jetpackStatus over MQTT
/* 
String jsonJetpackStatus="{\"state\":{\"reported\":";
jsonJetpackStatus+=jetpackStatus;
jsonJetpackStatus += " } }"; // {"state":{"reported":{..,..,..,..,..,..,..,..}  } }
mqtt.publish( jsonJetpackStatus.c_str() );	
*/
