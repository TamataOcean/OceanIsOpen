/*********************************************************************
* WaterMonitor.ino
*
* Copyright (C)    2019   [DFRobot](http://www.dfrobot.com)
* GitHub Link :https://github.com/DFRobot/watermonitor
* This Library is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Description:
* This sample code is mainly used to monitor water quality
* including ph, temperature, dissolved oxygen, ec and orp,etc.
*
* Software Environment: Arduino IDE 1.8.9
* Software download link: https://www.arduino.cc/en/Main/Software
*
* Install the library file：
* Copy the files from the github repository folder libraries to the libraries
* in the Arduino IDE 1.8.9 installation directory
*
* Hardware platform   : Teensy 3.6
* Sensor pin:
* EC  : A1
* PH  : A2
* ORP : A3
* RTC : I2C
* DO  : A0
* GravityDO：A4
* temperature:D5
*
* System will contact via Serial USB to publish data in JSON format.
*
* author  :  Rominco(rtourte@yahoo.fr)
* version :  V1.1
* date    :  2020-07-27
**********************************************************************/

#include <SPI.h>
//#include <Ethernet.h>
//#include <PubSubClient.h>
//#include "NetworkControl.h"

#include <SD.h>
#include <Wire.h>
#include "GravitySensorHub.h"
#include "GravityRtc.h"
#include "GravityPh.h"
#include "GravityDo.h"
#include "OneWire.h"
#include "SdService.h"
#include "Debug.h"
#include <ArduinoJson.h>

DynamicJsonDocument jsonDoc(256); 


//Create variable to track time
unsigned long updateTime = 0;
long logInterval = 10000;
unsigned long previousLogTime = 0;

// Alias sensor logic as sensorHub 
GravitySensorHub sensorHub ;
String name = "TEENSY-SERIAL";
int start_log = 0;

/*************************/
/*        SETUP          */
/*************************/
void setup() {
	//SERIAL INIT
	Serial.begin(115200);
	delay(1000);
	Debug::println("INIT_SENSOR_HUB");
	
	/**************************/
	/* 			SENSORS SETUP 		*/
  //Reset and initialize sensors
	Debug::println("... SensorHub setup begin...");
	sensorHub.setup();

	//Apply calibration offsets
	//Calibrate pH
	((GravityPh*)(sensorHub.sensors[phSensor]))->setOffset(PHOFFSET);
	Debug::print("pH offset: ");
	Debug::println(PHOFFSET);
}

/*************************/
/*        LOOP           */
/*************************/
void loop() {

  if (  ((millis() - previousLogTime) >= logInterval || previousLogTime == 0 ) && start_log ) {
    //Collect sensor readings
    sensorHub.update();
    //Export sensor in JSON
    Serial.println(sensorHub.getJsonSensorsUpdate().c_str());
    previousLogTime = millis(); 
    }

  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    Serial.print( name + " - message received : ");
    Serial.println(data);
    commandManager(data);
  }  
}

/********************************/
/* Management Command order     */
/********************************/
int commandManager(String message) {
  DeserializationError error = deserializeJson(jsonDoc, message);
  if(error) {
    Serial.println("parseObject() failed");
    //return false;
  }

  if ( jsonDoc["order"] == "Init_connection_from_Raspi") {
    Serial.println( name + " - INIT Raspi received ");
    configToSerial();
  }
  else if ( jsonDoc["order"] == "getConfig") {
    Serial.println( name + " - getConfig received ");
    configToSerial();
  }
  else if (jsonDoc["order"] == "restart") {
    Serial.println( name + " - RESTART in progress ");
    _reboot_Teensyduino_();
    //ESP.restart();
  }
  
  else if (jsonDoc["order"] == "calibratePh") {
    Serial.println( name + " - CALIBRATE PH in progress ");
    ((GravityPh*)(sensorHub.sensors[phSensor]))->setOffset(PHOFFSET);
    Debug::print("pH offset: ");
    Debug::println(PHOFFSET);
  }
  
  else if (jsonDoc["order"] == "startLog") {
    Serial.println( name + " - Start log received ");
    Serial.print( name + " - Using interval : " );
    Serial.println( logInterval );
    start_log = 1;
  }

  else if (jsonDoc["order"] == "stopLog") {
    Serial.println( name + " - StopLog received");
    start_log = 0;
  }

  else if (jsonDoc["order"] == "update_interval" ) {
    Serial.print( name + " - Interval update received = ");
    Serial.println( jsonDoc["value"].as<long>() );
    if (jsonDoc["value"].as<long>() > 500 ) {
      logInterval = jsonDoc["value"].as<long>();
    }
    else { 
      Serial.println("Interval < 500 limit");
    }
    Serial.print(name + " - New interval : " );
    Serial.println(logInterval);
    //logInterval = newInterval;
  }
  else if (jsonDoc["order"] == "config" ) {
    Serial.println(name + " - config requested");
    configToSerial();
  }
  else {
    Serial.println(name + " - Unknown command : " + message );
  }
}

void configToSerial(){
    DynamicJsonDocument doc(1024);
    
    char SensorName[] = "{\"sensor1\":{\"name\":\"phSensor\", \"calibrationStep\":2}, \"sensor2\":{\"name\":\"temperatureSensor\",\"calibrationStep\":0}, \"sensor3\":{\"name\":\"doSensor\",\"calibrationStep\":0},\"sensor4\":{\"name\":\"ecSensor\",\"calibrationStep\":0}, \"sensor5\":{\"name\":\"tdsSensor\",\"calibrationStep\":2}, \"sensor6\":{\"name\":\"orpSensor\",\"calibrationStep\":0}, \"sensor7\":{\"name\":\"turbiditySensor\",\"calibrationStep\":0}}";
	  DeserializationError err= deserializeJson(doc, SensorName);
    if(err) {
      Serial.print(F(" - deserializeJson() failed with code "));
      Serial.println(err.c_str());
    } 
    
    doc["config"] = "Config_Teensy";
    doc["start_log"] = start_log;
    doc["logInterval"] = logInterval;
    
    //JsonArray sensor  = doc.createNestedArray(sensors);
    
    serializeJson(doc, Serial);
    Serial.println();

}
