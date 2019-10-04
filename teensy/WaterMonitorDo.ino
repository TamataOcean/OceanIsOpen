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
* System will contact via MQTT a mosquitto platform to publish data in JSON format.
*
* author  :  Rominco(rtourte@yahoo.fr)
* version :  V1.0
* date    :  2019-09-23
**********************************************************************/

#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>
//#include "NetworkControl.h"

#include <SD.h>
#include <Wire.h>
#include "GravitySensorHub.h"
#include "GravityRtc.h"
#include "GravityEc.h"
#include "GravityPh.h"
#include "GravityDo.h"
#include "OneWire.h"
#include "SdService.h"
#include "Debug.h"

// Alias clock module logic as rtc
//GravityRtc rtc;
// Alias SD logic as sdService applied to sensors
//SdService sdService = SdService(sensorHub.sensors);

// Alias sensor logic as sensorHub 
GravitySensorHub sensorHub ;

/* NETWORK & MQTT Config */
/*************************/
//NetworkControl netControl = NetworkControl(sensorHub.sensors);
byte mac[]    = {  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
IPAddress ip(172, 16, 0, 100);
IPAddress server(172, 16, 0, 2);
char* outTopic = "Topic/OUT";
char* inTopic = "Topic/IN";

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

EthernetClient ethClient;
PubSubClient client(ethClient);

void reconnect(int nbTry) {
  int cpt = 0;
  // Loop until we're reconnected
  while (!client.connected() && cpt < nbTry ) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(server)) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish(outTopic,sensorHub.getJsonSensorsUpdate().c_str());
      // ... and resubscribe
      client.subscribe(inTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try "+ (String)cpt + "/"+ (String)nbTry +". Next try in 5 seconds ");

      // Wait 5 seconds before retrying
      delay(5000);
      cpt++;
    }
  }
}

/*************************/
/*        SETUP          */
/*************************/
void setup() {
	//SERIAL INIT
	Serial.begin(9600);
	delay(1000);
	Debug::println("Serial begin");
	
	/********************************/
  	/* 			NETWORK SETUP 		*/
  	/*								*/
  	Debug::println("Network setup begin...");
  	
  	// Ethernet.init(20);  // Teensy++ 2.0
  	// if (Ethernet.hardwareStatus() == EthernetNoHardware) {
   //    Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
   //    while (true) {
   //      delay(1); // do nothing, no point running without Ethernet hardware
   //    }
  	// }
  	Ethernet.begin(mac, ip);
  	client.setServer(server, 1883);
  	client.setCallback(callback);
  	delay(1500);						  	// Allow the hardware to sort itself out

  	/********************************/
  	/* 			SENSORS SETUP 		*/
  	/*								*/
	//Reset and initialize sensors
	Debug::println("SensorHub setup begin...");
	sensorHub.setup();

	//Apply calibration offsets
	//Calibrate pH
	((GravityPh*)(sensorHub.sensors[phSensor]))->setOffset(PHOFFSET);
	Debug::print("pH offset: ");
	Debug::println(PHOFFSET);
	
	// Calibrate EC if present
	#ifdef SELECTEC
	((GravityEc*)(sensorHub.sensors[ecSensor]))->setKValue(ECKVALUE);
	Debug::print("EC K Value: ");
	Debug::println(ECKVALUE);
	#endif
	
	//initialize RTC module with computer time
	//Debug::println("rtc.setup");
	//rtc.setup();

	//Check for SD card and configure datafile
	//Serial::println("sdService setup");
	//sdService.setup();
}

//Create variable to track time
unsigned long updateTime = 0;
/*************************/
/*        LOOP           */
/*************************/
void loop() {

	//MQTT Connection 
	// if (!client.connected()) {	
 //    	reconnect(5);
 //  	}
 //  	client.loop();

	//Update time from clock module
	//rtc.update();

	//Collect sensor readings
	sensorHub.update();
	
	//Export sensor in JSON
	Serial.println("Sending to MQTT Topic : " + (String)MQTTTOPIC);
	Serial.println(sensorHub.getJsonSensorsUpdate());

	//If no connection... Write data to SD card
	//sdService.update();
}
