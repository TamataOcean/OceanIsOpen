/* WaterMonitor.ino
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
#include <LiquidCrystal.h>
#include <TinyGPSPlus.h>

#define DEBUG_AVR 

DynamicJsonDocument jsonDoc(256); 
DynamicJsonDocument jsonMessage(256); 

//Liquid Crystal 
const int rs = 26, en = 25, d0 = 5, d1 = 6, d2 = 7, d3 = 8;
LiquidCrystal lcd(rs, en, d0, d1, d2, d3);
int p=0;

// les branchements
const int boutonGauche = 4; // le bouton de gauche
const int boutonDroite = 3; // le bouton de droite

byte customChars[8][8] = {
    {
        B00000,
        B00000,
        B00000,
        B00000,
        B00000,
        B00001,
        B00011,
        B00101
    },{
        B00000,
        B00000,
        B00000,
        B00010,
        B10000,
        B01101,
        B11000,
        B11110
    },{
        B00000,
        B00000,
        B00010,
        B01000,
        B01100,
        B10010,
        B01100,
        B00010
    },{
        B01110,
        B01110,
        B01111,
        B11110,
        B11110,
        B11111,
        B11111,
        B11111
    },{
        B11100,
        B11100,
        B01100,
        B11110,
        B10111,
        B11001,
        B00111,
        B11101
    },{
        B10000,
        B00000,
        B00000,
        B00000,
        B00000,
        B10000,
        B11100,
        B11111
    },{
        B11111,
        B11111,
        B00000,
        B00000,
        B11111,
        B00000,
        B11111,
        B11111
    },{
        B11111,
        B11111,
        B00000,
        B11111,
        B00000,
        B00000,
        B00000,
        B00000
    }
};

byte Data[2][8] = {
    {
      B00000,
  B11111,
  B01010,
  B00111,
  B00010,
  B00010,
  B00010,
  B00010
    },{
  B00000,
  B11000,
  B10000,
  B00001,
  B00001,
  B00101,
  B10101,
  B10101
    }
};

int val=0;
void drawBanner();



//Create variable to track time
unsigned long updateTime = 0;
long logInterval = 10000;
unsigned long previousLogTime = 0;

// Alias sensor logic as sensorHub 
GravitySensorHub sensorHub ;
String name = TEENSYNAME;
int start_log = 0;

TinyGPSPlus gps;

/*************************/
/*        SETUP          */
/*************************/
void setup() {
	//SERIAL INIT
	Serial.begin(115200);
  Serial1.begin(COMM_BAUDRATE);
  String ans = "";
	delay(1000);

  // Checking for bluetooth module presence
  // Serial1.println("AT");
  // delay(100);
  // while (Serial1.available())
  //  ans.concat((char)Serial1.read()); 
  // if (ans != "OK\r\n")  {
  //   Serial.println("Bluetooth module : No module detected, check wiring...");
  //   Serial.println("Waiting for reboot...");
  //   return;
  // }
  // Serial.println("Bluetooth module : Module detected.");
  // ans = "";
	
  //Init LCD
  Serial.println("LCD BEGIN");
  lcd.begin(20, 4);
  for(int i = 0; i < 8; i++)
        lcd.createChar(i, customChars[i]);
    
    for(int i = 17;  i >= 0; i--){
        lcd.clear();
        drawBanner(i);
        delay(250);
    }
  
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

	Debug::println("Calibration Step to Serial ");
  sensorCalibrationStepToSerial();

  /****************************/
  /*      GNSS From RX5       */
  /****************************/
  Serial5.begin(115200);
  start_log = 1;
  logInterval = 2000;
}

/*************************/
/*        LOOP           */
/*************************/
void loop() {
  // Reading RX5 for GNSS data
  while (Serial5.available())
    {
      char c;
      c = Serial5.read();
      gps.encode(c);
    }
  
  if (  ((millis() - previousLogTime) >= logInterval || previousLogTime == 0 ) && start_log ) {
    //Collect sensor readings
    sensorHub.update();
    //Export sensor in JSON
    Serial.println(sensorHub.getJsonSensorsUpdate().c_str());
    
    String json = "{";
    json += "\"id\":\"OceanIsOpen_98:d3:61:fd:6c:e4\"";
    json += ",\"time\":\"" + (String)gps.date.year() + "/" + (String)gps.date.month() + "/" + (String)gps.date.day() + " ";
    json += (String)gps.time.hour() + ":" + (String)gps.time.minute() + ":" + (String)gps.time.second() + "." +  (String)gps.time.centisecond() + "\",";
    json += "\"lon\":" + String(gps.location.lng(),8) + ","; 
    json += "\"lat\":" + String(gps.location.lat(),8) + ",";
    for (int i =0 ; i<7 ; i++) {
        if ( i == 6 ) {
          json += "\"" + (String)sensorHub.getSensorName(i) + "\":" + (String)sensorHub.getValue(i);
        }
        else {
          json += "\"" + (String)sensorHub.getSensorName(i) + "\":" + (String)sensorHub.getValue(i) + ",";
      }}
      json += "}";

      Serial.println(json);

      // Sending over Bluetooth
      Serial1.println(json);
      previousLogTime = millis(); 
    }

   // Receiving order from Serial
   if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    Serial.print( name + " - message received : ");
    Serial.println(data);
    //lcdPrint("message received :" + data);      //DEBUG MODE WITH LCD
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
    lcdPrint("ParseObject() failed");
    //return false;
  }

  // {"order":"Init_connection_from_Raspi"}
  if ( jsonDoc["order"] == "Init_connection_from_Raspi") {
    Serial.println( name + " - INIT Raspi received ");
    lcdPrint("INIT Raspi received ");
    configToSerial();
  }
  else if ( jsonDoc["order"] == "getConfig") {
    Serial.println( name + " - getConfig received ");
    lcdPrint("getConfig received ");
    configToSerial();
  }
  else if (jsonDoc["order"] == "restart") {
    Serial.println( name + " - RESTART in progress ");
    _reboot_Teensyduino_();
    //ESP.restart();
  }

  /* CALIBRATION WORKFLOW */
  /* ******************** */
  // Exemple order : {"order":"calibrate", "sensorId":0}
  else if (jsonDoc["order"] == "initCalibration") {
    int sensorId = jsonDoc["sensorId"].as<int>();
    Serial.println( name + " - initCalibration order received for sensor : " + sensorId);
    lcdPrint("initCalibration order received for sensor : " + sensorId );
    (sensorHub.sensors[sensorId])->initCalibration();
    Debug::println((sensorHub.sensors[sensorId])->getCalibrationMessage() );
    lcdPrint((sensorHub.sensors[sensorId])->getCalibrationMessage());
  }

  else if (jsonDoc["order"] == "calibrate") {
    int sensorId = jsonDoc["sensorId"].as<int>();
    Serial.println( name + " - CALIBRATE order received for sensor : " + sensorId);
    lcdPrint(" - CALIBRATE order received for sensor : " + sensorId );
    Debug::println(name + " - Sensor current calibration step = " + (sensorHub.sensors[sensorId])->getCalibrationCurrentStep());
    //(sensorHub.sensors[sensorId])->setCalibrationCurrentStep( (sensorHub.sensors[sensorId])->getCalibrationCurrentStep()+1);
    // ((GravityPh*)(sensorHub.sensors[sensorId]))->calibrate("CALPH");
    (sensorHub.sensors[sensorId])->calibrate();
    Debug::println(name + " - Sensor new calibration Step = " + (sensorHub.sensors[sensorId])->getCalibrationCurrentStep() );
    Debug::println(name + " - Sensor isCalibrated ? = " + (sensorHub.sensors[sensorId])->isCalibrate() );
    Debug::println((sensorHub.sensors[sensorId])->getCalibrationMessage() );

    error = deserializeJson(jsonMessage, (sensorHub.sensors[sensorId])->getCalibrationMessage());
    if(error) {
      Serial.println("parseObject() failed for jsonMessage" );
      lcdPrint("ParseObject() failed for jsonMessage ");
    //return false;
    } else {
      Serial.println("jsonMessage parsed = " + (sensorHub.sensors[sensorId])->getCalibrationMessage() );
      String msg = jsonMessage["calibrationAnswer"]["message"];
      Serial.println( msg );
      lcdPrint(msg );  
    }
    
  }

  else if (jsonDoc["order"] == "calibrationStatus") {
    Serial.println( name + " - CALIBRATE Info received");
    Serial.println(sensorHub.getCalibrationStatus().c_str());
    lcdPrint("calibrationStatus order received");
  }

  else if (jsonDoc["order"] == "sensorInfo") {
    int sensorId = jsonDoc["sensorId"].as<int>();
    Serial.println( name + " - sensorInfo order received for sensor : " + sensorId);
    //sensorHub.getSensorInfo( sensorId );
    Debug::println(name + " - Sensor info for " + sensorHub.getSensorName(sensorId) );
    Debug::println( sensorHub.getSensorInfo(sensorId) );
    lcdPrint("sensorInfo order received");
  }

  /* START / STOP LOG */
  /********************/
  else if (jsonDoc["order"] == "startLog") {
    Serial.println( name + " - Start log received ");
    Serial.print( name + " - Using interval : " );
    Serial.println( logInterval );
    lcdPrint("Start log received");
    start_log = 1;
  }

  else if (jsonDoc["order"] == "stopLog") {
    Serial.println( name + " - StopLog received");
    lcdPrint("Stop log received");
    start_log = 0;
  }
  // {"order":"update_interval", "value":1000}
  else if (jsonDoc["order"] == "update_interval" ) {
    Serial.print( name + " - Interval update received = ");
    Serial.println( jsonDoc["value"].as<long>() );
    if (jsonDoc["value"].as<long>() > 500 ) {
      logInterval = jsonDoc["value"].as<long>();
    }
    else { 
      Serial.println("Interval < 500 limit");
    }
    Serial.print(name + " - new Interval log set : " );
    Serial.println(logInterval);
    Serial.println("{\"update_intervalAnswer\":{\"newInterval\":"+(String)logInterval + "}}");
    lcdPrint("New interval received : " + (String)logInterval );
    //logInterval = newInterval;
  }
  else {
    Serial.println(name + " - Unknown command : " + message );
    lcdPrint("Unknown command: "+ message);
  }
}

void configToSerial(){
    // NOT WORKING
    // DynamicJsonDocument doc(1024);
    // doc["config"] = "Config_Teensy";
    // doc["start_log"] = start_log;
    // doc["logInterval"] = logInterval;
    // doc["sensors"] = sensorHub.getJsonConfig();

    // char SensorName[] = "{\"sensors\":{\"sensor1\":{\"name\":\"phSensor\", \"calibrationStep\":2, \"calibrationCurrentStep\":0 }, \"sensor2\":{\"name\":\"temperatureSensor\",\"calibrationStep\":0,\"calibrationCurrentStep\":0}, \"sensor3\":{\"name\":\"doSensor\",\"calibrationStep\":0,\"calibrationCurrentStep\":0},\"sensor4\":{\"name\":\"ecSensor\",\"calibrationStep\":0,\"calibrationCurrentStep\":0}, \"sensor5\":{\"name\":\"tdsSensor\",\"calibrationStep\":2, \"calibrationCurrentStep\":0}, \"sensor6\":{\"name\":\"orpSensor\",\"calibrationStep\":0, \"calibrationCurrentStep\":0}, \"sensor7\":{\"name\":\"turbiditySensor\",\"calibrationStep\":0, \"calibrationCurrentStep\":0}}}";
	  // DeserializationError err= deserializeJson(doc, SensorName);
    // if(err) {
    //   Serial.print(F(" - deserializeJson() failed with code "));
    //   Serial.println(err.c_str());
    // } 
    //JsonArray sensor  = doc.createNestedArray(sensors);
    //serializeJson(doc, Serial);

    // OLD SCHOOL 
    String json = "{";
	  json += "\"config\":\"Config_Teensy\",";
    json += "\"start_log\":" + (String)start_log +","; 
    json += "\"logInterval\":" + (String)logInterval + ",";
	  json += "\"sensors\":" + sensorHub.getJsonConfig();
    json += "}";
    
    Serial.println(json);
    lcdPrint(json);
}

void sensorCalibrationStepToSerial(){
  Serial.println(sensorHub.getCalibrationStatus().c_str());
}

void drawBanner(int offset){
    for(int j = 1; j < 3; j++){
        for(int i = 0; i < 3; i++){
            lcd.setCursor(offset+i, j);
            int characterIndex = (j-1) * 3 + i;
            lcd.write(byte(characterIndex));
        }
    }
    
    lcd.setCursor(offset+4,1);
    lcd.write("Ocean is Open");    
    lcd.setCursor(offset+4,2);
    lcd.write("WATER ANALYSER");
    
}

void lcdPrint(String message){
  lcd.clear();
  delay(50);
  lcd.setCursor(0,0);
lcd.print(message);

}
